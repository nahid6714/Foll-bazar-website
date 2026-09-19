-- Fol Bazar product gallery support
-- Run once in Supabase SQL Editor before saving/using multiple product photos.

alter table if exists public.products
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;

-- Put the existing main image into the gallery for older products.
update public.products
set gallery_urls = jsonb_build_array(image_url)
where gallery_urls = '[]'::jsonb
  and image_url is not null
  and image_url <> '';

-- Keep the main image and gallery consistent for products that already have a gallery.
update public.products
set gallery_urls = (
  case
    when image_url is null or image_url = '' then gallery_urls
    when gallery_urls @> jsonb_build_array(image_url) then gallery_urls
    else jsonb_build_array(image_url) || gallery_urls
  end
)
where image_url is not null and image_url <> '';
