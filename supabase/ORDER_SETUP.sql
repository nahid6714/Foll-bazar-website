create extension if not exists pgcrypto;

-- ফল বাজার: website -> Supabase -> Admin App order pipeline
-- Run once in Supabase SQL Editor.

alter table public.orders add column if not exists shipping_method text;
alter table public.orders add column if not exists delivery_area text;
alter table public.orders add column if not exists payment_title text;
alter table public.orders add column if not exists sender_phone text;
alter table public.orders add column if not exists trx_id text;
alter table public.orders add column if not exists coupon_code text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
check (payment_method in ('cod','bkash','nagad','rocket','bank','shurjopay','card'));

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_phone_idx on public.orders(customer_phone);
create index if not exists orders_payment_status_idx on public.orders(payment_status);

create or replace function public.create_public_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
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
  v_coupon text;
  v_subtotal numeric(12,2);
  v_discount numeric(12,2);
  v_delivery numeric(12,2);
  v_total numeric(12,2);
  v_user_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_product_name text;
  v_variant_label text;
  v_unit_price numeric(12,2);
  v_quantity integer;
  v_line_total numeric(12,2);
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
  v_coupon := nullif(trim(payload->>'coupon_code'), '');
  v_subtotal := greatest(coalesce((payload->>'subtotal')::numeric, 0), 0);
  v_discount := greatest(coalesce((payload->>'discount_amount')::numeric, 0), 0);
  v_user_id := nullif(payload->>'user_id', '')::uuid;

  if v_name is null or v_phone is null or v_address is null then
    raise exception 'নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা আবশ্যক';
  end if;
  if v_shipping not in ('dhaka','outside') then raise exception 'অবৈধ shipping option'; end if;
  if v_payment not in ('cod','bkash','nagad','rocket','bank','shurjopay','card') then raise exception 'অবৈধ payment method'; end if;

  v_delivery := case when v_shipping = 'dhaka' then 60 else 120 end;
  v_discount := least(v_discount, v_subtotal);
  v_total := greatest(v_subtotal - v_discount + v_delivery, 0);

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    address, order_note, shipping_method, delivery_area,
    subtotal, delivery_charge, discount_amount, total_amount,
    payment_method, payment_status, payment_title, sender_phone, trx_id, coupon_code, status
  ) values (
    coalesce(v_order_number, 'FB-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10))),
    v_user_id, v_name, v_phone, v_email, v_address, v_note,
    v_shipping, case when v_shipping = 'dhaka' then 'ঢাকার ভিতরে' else 'ঢাকার বাইরে' end,
    v_subtotal, v_delivery, v_discount, v_total,
    v_payment, 'pending', v_payment_title, v_sender, v_trx, v_coupon, 'pending'
  ) returning id, order_number into v_order_id, v_order_number;

  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'অর্ডারে অন্তত একটি পণ্য থাকতে হবে';
  end if;

  for v_item in select value from jsonb_array_elements(payload->'items') loop
    select p.id, p.name, p.price into v_product_id, v_product_name, v_unit_price
    from public.products p
    where p.id::text = v_item->>'product_id' or p.legacy_id = v_item->>'product_id'
    limit 1;
    if v_product_id is null then raise exception 'পণ্য পাওয়া যায়নি: %', v_item->>'product_id'; end if;

    v_variant_id := null;
    v_variant_label := nullif(trim(v_item->>'variant_label'), '');
    v_quantity := greatest(coalesce((v_item->>'quantity')::integer, 0), 0);
    if v_variant_label is not null then
      select pv.id, pv.label, pv.price into v_variant_id, v_variant_label, v_unit_price
      from public.product_variants pv
      where pv.product_id = v_product_id and pv.label = v_variant_label and pv.is_active = true
      limit 1;
    end if;
    if v_quantity <= 0 then raise exception 'অবৈধ product quantity'; end if;
    v_line_total := round(v_unit_price * v_quantity, 2);

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity, line_total
    ) values (
      v_order_id, v_product_id, v_variant_id, v_product_name, v_variant_label, v_unit_price, v_quantity, v_line_total
    );
  end loop;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
exception when unique_violation then
  raise exception 'এই Order ID ইতিমধ্যে ব্যবহার হয়েছে। আবার অর্ডার করুন।';
end;
$$;

revoke all on function public.create_public_order(jsonb) from public;
grant execute on function public.create_public_order(jsonb) to anon, authenticated;


-- Tell PostgREST to refresh its schema cache immediately after the function is created.
notify pgrst, 'reload schema';
