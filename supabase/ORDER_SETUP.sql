-- ফল বাজার: Website -> Supabase -> Admin App order pipeline
-- Run once in Supabase SQL Editor after the base schema and ADMIN_SETUP.sql.

-- Payment fields required by the existing checkout UI.
alter table public.orders
  add column if not exists payment_trx_id text,
  add column if not exists payment_sender_phone text,
  add column if not exists shipping_area text,
  add column if not exists coupon_code text;

-- Keep all payment methods currently offered by the website.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod','bkash','nagad','rocket','bank','shurjopay','card'));

create or replace function public.create_public_order(
  p_order jsonb,
  p_items jsonb
)
returns table (id uuid, "orderNumber" text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_delivery numeric(12,2) := greatest(0, coalesce((p_order->>'delivery_charge')::numeric, 0));
  v_discount numeric(12,2) := greatest(0, coalesce((p_order->>'discount_amount')::numeric, 0));
  v_total numeric(12,2);
  v_product_price numeric(12,2);
  v_variant text;
  v_multiplier numeric := 1;
  v_payment_method text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  if nullif(trim(p_order->>'customer_name'), '') is null then
    raise exception 'Customer name is required';
  end if;

  if nullif(trim(p_order->>'customer_phone'), '') is null then
    raise exception 'Customer phone is required';
  end if;

  if nullif(trim(p_order->>'address'), '') is null then
    raise exception 'Delivery address is required';
  end if;

  -- Recalculate item prices from the current product catalogue.
  for v_item in select value from jsonb_array_elements(p_items) loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
    exception when others then
      raise exception 'Invalid product id';
    end;

    select price into v_product_price
    from public.products
    where products.id = v_product_id
      and products.is_active = true;

    if v_product_price is null then
      raise exception 'Product is unavailable';
    end if;

    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity';
    end if;

    v_variant := nullif(v_item->>'variant_label', '');
    v_multiplier := case
      when v_variant = '৫০০ গ্রাম' then 0.5
      when v_variant = '২ কেজি' then 2
      else 1
    end;

    v_unit_price := round(v_product_price * v_multiplier, 2);
    v_line_total := round(v_unit_price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_discount := least(v_discount, v_subtotal);
  v_total := greatest(0, v_subtotal - v_discount + v_delivery);

  v_payment_method := case
    when p_order->>'payment_method' in ('cod','bkash','nagad','rocket','bank','shurjopay','card')
      then p_order->>'payment_method'
    else 'cod'
  end;

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    division, district, upazila, address, shipping_area, delivery_note,
    subtotal, delivery_charge, discount_amount, total_amount, coupon_code,
    payment_method, payment_trx_id, payment_sender_phone, payment_status,
    status, order_note
  ) values (
    coalesce(nullif(trim(p_order->>'order_number'), ''), 'FB-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS')),
    auth.uid(),
    trim(p_order->>'customer_name'),
    trim(p_order->>'customer_phone'),
    nullif(trim(p_order->>'customer_email'), ''),
    nullif(trim(p_order->>'division'), ''),
    nullif(trim(p_order->>'district'), ''),
    nullif(trim(p_order->>'upazila'), ''),
    trim(p_order->>'address'),
    nullif(trim(p_order->>'shipping_area'), ''),
    nullif(trim(p_order->>'delivery_note'), ''),
    v_subtotal, v_delivery, v_discount, v_total,
    nullif(trim(p_order->>'coupon_code'), ''),
    v_payment_method,
    nullif(trim(p_order->>'payment_trx_id'), ''),
    nullif(trim(p_order->>'payment_sender_phone'), ''),
    'pending', 'pending',
    nullif(trim(p_order->>'order_note'), '')
  )
  returning orders.id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_variant := nullif(v_item->>'variant_label', '');
    v_quantity := (v_item->>'quantity')::integer;

    select price into v_product_price
    from public.products
    where products.id = v_product_id;

    v_multiplier := case
      when v_variant = '৫০০ গ্রাম' then 0.5
      when v_variant = '২ কেজি' then 2
      else 1
    end;
    v_unit_price := round(v_product_price * v_multiplier, 2);
    v_line_total := round(v_unit_price * v_quantity, 2);

    insert into public.order_items (
      order_id, product_id, product_name, variant_label, unit_price, quantity, line_total
    ) values (
      v_order_id, v_product_id, trim(v_item->>'product_name'), v_variant,
      v_unit_price, v_quantity, v_line_total
    );
  end loop;

  return query
    select v_order_id, o.order_number
    from public.orders o
    where o.id = v_order_id;
end;
$$;

revoke all on function public.create_public_order(jsonb, jsonb) from public;
grant execute on function public.create_public_order(jsonb, jsonb) to anon, authenticated;
