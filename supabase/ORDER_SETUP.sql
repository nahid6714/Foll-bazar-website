create extension if not exists pgcrypto;

-- =========================================================
-- FOL BAZAR - SECURE WEBSITE ORDER PIPELINE
-- Uses the existing products/categories/orders/order_items/
-- product_variants/coupons/coupon_usages schema.
-- =========================================================

create or replace function public.create_public_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_name text;
  v_phone text;
  v_email text;
  v_address text;
  v_note text;
  v_shipping text;
  v_payment text;
  v_payment_title text;
  v_sender text;
  v_trx text;
  v_coupon_code text;
  v_user_id uuid := auth.uid();
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_delivery numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_coupon_id uuid;
  v_coupon_type text;
  v_coupon_value numeric(12,2);
  v_coupon_min numeric(12,2);
  v_coupon_max numeric(12,2);
  v_coupon_limit integer;
  v_coupon_used integer;
  v_coupon_active boolean;
  v_coupon_start timestamptz;
  v_coupon_expire timestamptz;
  v_item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_product_name text;
  v_variant_label text;
  v_weight integer;
  v_unit_price numeric(12,2);
  v_quantity integer;
  v_line_total numeric(12,2);
  v_stock integer;
  v_has_variant boolean;
  v_requested_product text;
  v_requested_variant text;
begin
  v_order_number := nullif(trim(payload->>'order_number'), '');
  v_name := nullif(trim(payload->>'customer_name'), '');
  v_phone := nullif(trim(payload->>'customer_phone'), '');
  v_email := nullif(trim(payload->>'customer_email'), '');
  v_address := nullif(trim(payload->>'address'), '');
  v_note := nullif(trim(payload->>'order_note'), '');
  v_shipping := lower(coalesce(payload->>'shipping_method', 'dhaka'));
  v_payment := lower(coalesce(payload->>'payment_method', 'cod'));
  if v_payment = 'cash' then v_payment := 'cod'; end if;
  v_payment_title := nullif(trim(payload->>'payment_title'), '');
  v_sender := nullif(trim(payload->>'sender_phone'), '');
  v_trx := nullif(trim(payload->>'trx_id'), '');
  v_coupon_code := nullif(upper(trim(payload->>'coupon_code')), '');

  if v_name is null or length(v_name) < 2 then
    raise exception 'নাম আবশ্যক';
  end if;
  if v_phone is null or length(regexp_replace(v_phone, '[^0-9]', '', 'g')) < 11 then
    raise exception 'সঠিক মোবাইল নম্বর দিন';
  end if;
  if v_address is null or length(v_address) < 5 then
    raise exception 'সম্পূর্ণ ডেলিভারি ঠিকানা আবশ্যক';
  end if;
  if v_shipping not in ('dhaka','outside') then
    raise exception 'অবৈধ shipping option';
  end if;
  if v_payment not in ('cod','bkash','nagad','rocket','bank','shurjopay','card') then
    raise exception 'অবৈধ payment method';
  end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'অর্ডারে অন্তত একটি পণ্য থাকতে হবে';
  end if;

  -- Never trust client totals. Shipping is fixed by the selected area.
  v_delivery := case when v_shipping = 'dhaka' then 60 else 120 end;

  -- Validate and lock coupon before calculating the order.
  if v_coupon_code is not null then
    select id, discount_type, discount_value, min_order, max_discount,
           usage_limit, used_count, is_active, starts_at, expires_at
      into v_coupon_id, v_coupon_type, v_coupon_value, v_coupon_min,
           v_coupon_max, v_coupon_limit, v_coupon_used, v_coupon_active,
           v_coupon_start, v_coupon_expire
    from public.coupons
    where upper(code) = v_coupon_code
    for update;

    if not found then raise exception 'কুপন কোডটি পাওয়া যায়নি'; end if;
    if not v_coupon_active then raise exception 'কুপনটি বর্তমানে সক্রিয় নয়'; end if;
    if v_coupon_start is not null and now() < v_coupon_start then raise exception 'কুপনটি এখনো শুরু হয়নি'; end if;
    if v_coupon_expire is not null and now() > v_coupon_expire then raise exception 'কুপনের মেয়াদ শেষ'; end if;
    if v_coupon_limit is not null and v_coupon_used >= v_coupon_limit then raise exception 'কুপনের ব্যবহার সীমা শেষ'; end if;
  end if;

  -- Build line items from database prices and atomically reserve stock.
  for v_item in select value from jsonb_array_elements(payload->'items') loop
    v_requested_product := nullif(trim(v_item->>'product_id'), '');
    v_requested_variant := nullif(trim(v_item->>'variant_label'), '');
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    if v_quantity <= 0 or v_quantity > 50 then raise exception 'অবৈধ product quantity'; end if;

    select p.id, p.name, p.price
      into v_product_id, v_product_name, v_unit_price
    from public.products p
    where p.is_active = true
      and (p.id::text = v_requested_product or p.legacy_id = v_requested_product)
    limit 1;

    if v_product_id is null then
      raise exception 'পণ্য পাওয়া যায়নি: %', v_requested_product;
    end if;

    v_variant_id := null;
    v_variant_label := v_requested_variant;
    v_weight := null;
    v_has_variant := false;

    if v_requested_variant is not null then
      -- Lock the variant row when it exists. DB price/stock is authoritative.
      select pv.id, pv.label, pv.weight_grams, pv.price, pv.stock_quantity
        into v_variant_id, v_variant_label, v_weight, v_unit_price, v_stock
      from public.product_variants pv
      where pv.product_id = v_product_id
        and pv.label = v_requested_variant
        and pv.is_active = true
      for update;

      if found then
        v_has_variant := true;
        if v_stock < v_quantity then
          raise exception 'এই ভ্যারিয়েন্টের পর্যাপ্ত stock নেই: %', v_variant_label;
        end if;
        update public.product_variants
        set stock_quantity = stock_quantity - v_quantity
        where id = v_variant_id;
        update public.products
        set sold_quantity = sold_quantity + v_quantity
        where id = v_product_id;
      else
        -- Backward-compatible fallback for products that have no variant rows.
        -- Price is still derived from the DB product price, never the client price.
        v_unit_price := (select p.price from public.products p where p.id = v_product_id);
        v_stock := (select p.stock_quantity from public.products p where p.id = v_product_id for update);
        if v_requested_variant = '৫০০ গ্রাম' then
          v_unit_price := round(v_unit_price * 0.5, 2);
          v_weight := 500;
        elsif v_requested_variant = '২ কেজি' then
          v_unit_price := round(v_unit_price * 2, 2);
          v_weight := 2000;
        elsif v_requested_variant = '১ কেজি' then
          v_weight := 1000;
        else
          raise exception 'অজানা product variant: %', v_requested_variant;
        end if;
        if v_stock < v_quantity then
          raise exception 'এই পণ্যের পর্যাপ্ত stock নেই';
        end if;
        update public.products
        set stock_quantity = stock_quantity - v_quantity,
            sold_quantity = sold_quantity + v_quantity
        where id = v_product_id;
      end if;
    else
      select stock_quantity into v_stock
      from public.products where id = v_product_id for update;
      if v_stock < v_quantity then raise exception 'এই পণ্যের পর্যাপ্ত stock নেই'; end if;
      update public.products
      set stock_quantity = stock_quantity - v_quantity,
          sold_quantity = sold_quantity + v_quantity
      where id = v_product_id;
    end if;

    v_line_total := round(v_unit_price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;

    -- Store the item data temporarily in a JSON array on the order payload.
    payload := jsonb_set(
      payload,
      '{_server_items}',
      coalesce(payload->'_server_items', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'product_id', v_product_id,
          'variant_id', v_variant_id,
          'product_name', v_product_name,
          'variant_label', v_variant_label,
          'weight_grams', v_weight,
          'unit_price', v_unit_price,
          'quantity', v_quantity,
          'line_total', v_line_total
        )
      )
    );
  end loop;

  -- Coupon discount is calculated from the server-calculated subtotal.
  if v_coupon_id is not null then
    if v_subtotal < v_coupon_min then
      raise exception 'এই কুপনের জন্য minimum order ৳% প্রয়োজন', v_coupon_min;
    end if;
    if v_coupon_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon_value / 100, 2);
      if v_coupon_max is not null then v_discount := least(v_discount, v_coupon_max); end if;
    elsif v_coupon_type = 'fixed' then
      v_discount := least(v_coupon_value, v_subtotal);
    else
      raise exception 'কুপনের discount type অবৈধ';
    end if;
  end if;

  v_discount := greatest(least(v_discount, v_subtotal), 0);
  v_total := greatest(v_subtotal - v_discount + v_delivery, 0);

  if v_order_number is null then
    v_order_number := 'FB-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10));
  end if;

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    address, order_note, shipping_method, delivery_area,
    subtotal, delivery_charge, discount_amount, total_amount,
    payment_method, payment_status, payment_title, sender_phone, trx_id,
    coupon_code, status
  ) values (
    v_order_number, v_user_id, v_name,
    regexp_replace(v_phone, '[^0-9+]', '', 'g'), v_email, v_address, v_note,
    v_shipping,
    case when v_shipping = 'dhaka' then 'ঢাকার ভিতরে' else 'ঢাকার বাইরে' end,
    v_subtotal, v_delivery, v_discount, v_total,
    v_payment, 'pending', v_payment_title, v_sender, v_trx,
    v_coupon_code, 'pending'
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(payload->'_server_items') loop
    insert into public.order_items (
      order_id, product_id, variant_id, product_name, variant_label,
      weight_grams, unit_price, quantity, line_total
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      nullif(v_item->>'variant_id', '')::uuid,
      v_item->>'product_name',
      nullif(v_item->>'variant_label', ''),
      nullif(v_item->>'weight_grams', '')::integer,
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'line_total')::numeric
    );
  end loop;

  if v_coupon_id is not null then
    insert into public.coupon_usages (coupon_id, user_id, order_id)
    values (v_coupon_id, v_user_id, v_order_id);
    update public.coupons
    set used_count = used_count + 1
    where id = v_coupon_id;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'delivery_charge', v_delivery,
    'total_amount', v_total
  );

exception
  when unique_violation then
    raise exception 'এই Order ID ইতিমধ্যে ব্যবহার হয়েছে। আবার অর্ডার করুন।';
end;
$$;

revoke all on function public.create_public_order(jsonb) from public;
grant execute on function public.create_public_order(jsonb) to anon, authenticated;
notify pgrst, 'reload schema';
