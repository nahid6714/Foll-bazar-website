-- =========================================================
-- FOL BAZAR - PUBLIC ORDER TRACKING + ADMIN-CONTROLLED BANNERS
-- Run once in Supabase SQL Editor.
-- Website remains usable with its local banner fallback if this is not
-- installed yet; after installation Supabase becomes the banner source.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1) Banner table
-- ---------------------------------------------------------
create table if not exists public.site_banners (
  id uuid not null default gen_random_uuid(),
  banner_type text not null default 'hero',
  title text null,
  alt_text text not null default 'ফল বাজার ব্যানার',
  image_url text not null,
  link_url text null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_banners_pkey primary key (id),
  constraint site_banners_type_check check (banner_type in ('hero','promo'))
);

create index if not exists site_banners_active_order_idx
  on public.site_banners (banner_type, is_active, sort_order);

alter table public.site_banners enable row level security;

-- Public website can only read active banners.
drop policy if exists "Public can read active banners" on public.site_banners;
create policy "Public can read active banners"
on public.site_banners
for select
to anon, authenticated
using (is_active = true);

-- Admin app can create/update/delete banners through the existing is_admin() helper.
drop policy if exists "Admins can manage banners" on public.site_banners;
create policy "Admins can manage banners"
on public.site_banners
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.site_banners to anon, authenticated;
grant insert, update, delete on public.site_banners to authenticated;

-- ---------------------------------------------------------
-- 2) Public-safe order tracking function
-- Does NOT expose the orders table directly to anon users.
-- It returns only one matching order and only safe tracking fields.
-- ---------------------------------------------------------
create or replace function public.track_public_order(
  p_order_number text default null,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_input_phone text;
  v_normalized_phone text;
begin
  v_input_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  -- Normalize common Bangladeshi formats:
  -- 017xxxxxxxx / 88017xxxxxxxx / +88017xxxxxxxx
  if left(v_input_phone, 3) = '880' and length(v_input_phone) = 13 then
    v_normalized_phone := '0' || substr(v_input_phone, 4);
  elsif length(v_input_phone) = 10 and left(v_input_phone, 1) = '1' then
    v_normalized_phone := '0' || v_input_phone;
  else
    v_normalized_phone := v_input_phone;
  end if;

  if nullif(trim(coalesce(p_order_number, '')), '') is not null then
    select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_order_number))
    order by created_at desc
    limit 1;
  elsif v_normalized_phone <> '' then
    select * into v_order
    from public.orders
    where (
      regexp_replace(customer_phone, '[^0-9]', '', 'g') = v_normalized_phone
      or (
        left(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 3) = '880'
        and ('0' || substr(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 4)) = v_normalized_phone
      )
    )
    order by created_at desc
    limit 1;
  else
    return null;
  end if;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'total_amount', v_order.total_amount,
    'created_at', v_order.created_at
  );
end;
$$;

revoke all on function public.track_public_order(text, text) from public;
grant execute on function public.track_public_order(text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------
-- 3) Seed the existing website banners once.
-- If the table already contains banners, nothing is inserted.
-- ---------------------------------------------------------
insert into public.site_banners (banner_type, alt_text, image_url, sort_order, is_active)
select * from (values
  ('hero', 'সেরা স্বাদের দিনাজপুরের লিচু', 'https://demo.scaleuper.com/public/uploads/banner/1783258416-6a4a5d3013bed-baner1.webp', 0, true),
  ('hero', 'বাগানের তাজা পাকা লিচু হোম ডেলিভারি', 'https://demo.scaleuper.com/public/uploads/banner/1783258435-6a4a5d43ae0d7-baner2.webp', 1, true),
  ('hero', 'মিষ্টি রসাল প্রিমিয়াম কোয়ালিটি লিচু', 'https://demo.scaleuper.com/public/uploads/banner/1783258446-6a4a5d4ea5cdc-baner3.webp', 2, true),
  ('promo', 'প্রোমো ব্যানার ১', 'https://demo.scaleuper.com/public/uploads/banner/1783258512-6a4a5d903bad0-slider3.webp', 0, true),
  ('promo', 'প্রোমো ব্যানার ২', 'https://demo.scaleuper.com/public/uploads/banner/1783258500-6a4a5d84b79f8-slider2.webp', 1, true),
  ('promo', 'প্রোমো ব্যানার ৩', 'https://demo.scaleuper.com/public/uploads/banner/1783258484-6a4a5d745871e-slider1.webp', 2, true),
  ('promo', 'প্রোমো ব্যানার ৪', 'https://demo.scaleuper.com/public/uploads/banner/1783258463-6a4a5d5f9bdfc-slider1.webp', 3, true)
) as seed(banner_type, alt_text, image_url, sort_order, is_active)
where not exists (select 1 from public.site_banners);

notify pgrst, 'reload schema';
