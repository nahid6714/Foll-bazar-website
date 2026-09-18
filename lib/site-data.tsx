'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabaseRest } from '@/lib/supabase';
import {
  Product,
  categories as fallbackCategories,
  allProductsList as fallbackProducts,
  heroBanners as fallbackHeroBanners,
  promoBanners as fallbackPromoBanners,
} from '@/lib/data';

export type SiteBanner = {
  id: string;
  image: string;
  alt: string;
  type: 'hero' | 'promo';
  sortOrder: number;
  linkUrl?: string | null;
};

type SiteCategory = {
  name: string;
  slug: string;
  icon: string;
  hasSubmenu: boolean;
};

type SiteDataContextValue = {
  products: Product[];
  categories: SiteCategory[];
  flashSaleProducts: Product[];
  hotDealProducts: Product[];
  dinajpurProducts: Product[];
  premiumProducts: Product[];
  heroBanners: SiteBanner[];
  promoBanners: SiteBanner[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

function toProduct(row: any): Product {
  const price = Number(row.price ?? 0);
  const oldPrice = row.old_price == null ? null : String(Number(row.old_price));
  const category = row.categories?.slug ?? undefined;
  const categoryName = row.categories?.name ?? undefined;

  return {
    id: String(row.legacy_id ?? row.id),
    title: String(row.name ?? ''),
    image: String(row.image_url ?? '').trim(),
    price: String(price),
    oldPrice,
    soldText: Number(row.sold_quantity ?? 0) > 0
      ? `বিক্রি ${Number(row.sold_quantity)}`
      : null,
    progressWidth: null,
    discount: row.discount_percent == null ? null : `${row.discount_percent}%`,
    isFeatured: Boolean(row.is_featured),
    isFlashSale: Boolean(row.is_flash_sale),
    isHotDeal: Boolean(row.is_hot_deal),
    category,
    categoryName,
    slug: String(row.slug ?? '').trim() || undefined,
    stock: Math.max(0, Number(row.stock_quantity ?? 0)),
    description: row.description ? String(row.description).trim() || null : null,
  };
}


const PRODUCTS_SELECT_WITH_STOCK = 'products?select=id,legacy_id,name,slug,description,image_url,old_price,price,stock_quantity,sold_quantity,discount_percent,is_featured,is_flash_sale,is_hot_deal,sort_order,category_id,categories(name,slug)&is_active=eq.true&order=sort_order.asc';
const PRODUCTS_SELECT_LEGACY = 'products?select=id,legacy_id,name,slug,description,image_url,old_price,price,sold_quantity,discount_percent,is_featured,is_flash_sale,is_hot_deal,sort_order,category_id,categories(name,slug)&is_active=eq.true&order=sort_order.asc';

async function fetchProductsWithStock() {
  try {
    return await supabaseRest<any[]>(PRODUCTS_SELECT_WITH_STOCK);
  } catch (error) {
    // Keep the storefront usable if an older Supabase schema has not added stock_quantity yet.
    console.warn('stock_quantity is unavailable; loading products without stock data.', error);
    return await supabaseRest<any[]>(PRODUCTS_SELECT_LEGACY);
  }
}

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  // Do NOT pre-fill the page with the bundled demo catalogue. If we start
  // with fallback products/banners and then the real Supabase data arrives
  // a moment later, every image on the page suddenly swaps out from under
  // the visitor (old demo photos -> real photos), which looks broken.
  // Instead we keep `loading: true` until the real data (or, on failure,
  // the fallback) is actually known, and the homepage shows the skeleton
  // until then. This is a short wait, not a swap.
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [heroBanners, setHeroBanners] = useState<SiteBanner[]>([]);
  const [promoBanners, setPromoBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        fetchProductsWithStock(),
        supabaseRest<any[]>(
          'categories?select=id,name,slug,image_url,sort_order&is_active=eq.true&order=sort_order.asc'
        ),
      ]);

      let bannersResult: any[] = [];
      try {
        bannersResult = await supabaseRest<any[]>('site_banners?select=id,banner_type,image_url,alt_text,sort_order,link_url&is_active=eq.true&order=banner_type.asc,sort_order.asc');
      } catch (bannerError) {
        console.warn('Supabase banner table is unavailable; using local fallback banners.', bannerError);
        bannersResult = fallbackHeroBanners.map((b, i) => ({ id: String(b.id), banner_type: 'hero', image_url: b.image, alt_text: b.alt, sort_order: i, link_url: null }))
          .concat(fallbackPromoBanners.map((image, i) => ({ id: `fallback-promo-${i}`, banner_type: 'promo', image_url: image, alt_text: 'Promo banner', sort_order: i, link_url: null })));
      }

      const liveProducts = (productsResult ?? []).map(toProduct);

      setProducts(liveProducts.length > 0 ? liveProducts : fallbackProducts);

      const liveCategories = (categoriesResult ?? []).map((row: any) => ({
        name: String(row.name ?? ''),
        slug: String(row.slug ?? ''),
        icon: String(row.image_url ?? ''),
        hasSubmenu: false,
      }));

      setCategories(liveCategories.length > 0 ? liveCategories : fallbackCategories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, hasSubmenu: c.hasSubmenu })));

      const liveBanners = (bannersResult ?? []).filter((row: any) => String(row.image_url ?? '').trim());
      if (liveBanners.length > 0) {
        const mapped = liveBanners.map((row: any, index: number) => ({
          id: String(row.id ?? index),
          image: String(row.image_url ?? '').trim(),
          alt: String(row.alt_text ?? 'ফল বাজার ব্যানার'),
          type: String(row.banner_type) === 'promo' ? 'promo' : 'hero',
          sortOrder: Number(row.sort_order ?? index),
          linkUrl: row.link_url ? String(row.link_url) : null,
        })) as SiteBanner[];
        setHeroBanners(mapped.filter((b) => b.type === 'hero'));
        setPromoBanners(mapped.filter((b) => b.type === 'promo'));
      }
    } catch (err) {
      console.warn('Supabase catalogue load failed; using local fallback data.', err);
      setProducts(fallbackProducts);
      setCategories(fallbackCategories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, hasSubmenu: c.hasSubmenu })));
      setHeroBanners(fallbackHeroBanners.map((b, i) => ({ id: String(b.id), image: b.image, alt: b.alt, type: 'hero', sortOrder: i })));
      setPromoBanners(fallbackPromoBanners.map((image, i) => ({ id: `fallback-promo-${i}`, image, alt: 'Promo banner', type: 'promo', sortOrder: i })));
      setError(err instanceof Error ? err.message : 'Supabase data load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          fetchProductsWithStock(),
          supabaseRest<any[]>(
            'categories?select=id,name,slug,image_url,sort_order&is_active=eq.true&order=sort_order.asc'
          ),
        ]);

        let bannersResult: any[] = [];
        try {
          bannersResult = await supabaseRest<any[]>('site_banners?select=id,banner_type,image_url,alt_text,sort_order,link_url&is_active=eq.true&order=banner_type.asc,sort_order.asc');
        } catch (bannerError) {
          console.warn('Supabase banner table is unavailable; using local fallback banners.', bannerError);
          bannersResult = fallbackHeroBanners.map((b, i) => ({ id: String(b.id), banner_type: 'hero', image_url: b.image, alt_text: b.alt, sort_order: i, link_url: null }))
            .concat(fallbackPromoBanners.map((image, i) => ({ id: `fallback-promo-${i}`, banner_type: 'promo', image_url: image, alt_text: 'Promo banner', sort_order: i, link_url: null })));
        }

        if (ignore) return;
        const liveProducts = (productsResult ?? []).map(toProduct);
        setProducts(liveProducts.length > 0 ? liveProducts : fallbackProducts);

        const liveCategories = (categoriesResult ?? []).map((row: any) => ({
          name: String(row.name ?? ''),
          slug: String(row.slug ?? ''),
          icon: String(row.image_url ?? ''),
          hasSubmenu: false,
        }));

        setCategories(liveCategories.length > 0 ? liveCategories : fallbackCategories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, hasSubmenu: c.hasSubmenu })));

        const liveBanners = (bannersResult ?? []).filter((row: any) => String(row.image_url ?? '').trim());
        if (liveBanners.length > 0) {
          const mapped = liveBanners.map((row: any, index: number) => ({
            id: String(row.id ?? index),
            image: String(row.image_url ?? '').trim(),
            alt: String(row.alt_text ?? 'ফল বাজার ব্যানার'),
            type: String(row.banner_type) === 'promo' ? 'promo' : 'hero',
            sortOrder: Number(row.sort_order ?? index),
            linkUrl: row.link_url ? String(row.link_url) : null,
          })) as SiteBanner[];
          setHeroBanners(mapped.filter((b) => b.type === 'hero'));
          setPromoBanners(mapped.filter((b) => b.type === 'promo'));
        }
      } catch (err) {
        if (!ignore) {
          console.warn('Supabase catalogue load failed; using local fallback data.', err);
          setProducts(fallbackProducts);
          setCategories(fallbackCategories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, hasSubmenu: c.hasSubmenu })));
          setHeroBanners(fallbackHeroBanners.map((b, i) => ({ id: String(b.id), image: b.image, alt: b.alt, type: 'hero', sortOrder: i })));
          setPromoBanners(fallbackPromoBanners.map((image, i) => ({ id: `fallback-promo-${i}`, image, alt: 'Promo banner', type: 'promo', sortOrder: i })));
          setError(err instanceof Error ? err.message : 'Supabase data load failed');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const value = useMemo<SiteDataContextValue>(() => {

    // The database is the source of truth. These flags are encoded in the
    // product rows; use the current catalogue for all product sections.
    // Until those flags are queried separately, preserve the existing
    // visual grouping by matching the current site's featured IDs.
    const flashIds = new Set(['246','245','244','243','242','241','240','239','238','237']);
    const hotIds = new Set(['246','245','244','243','242','241','240','239','238','237']);

    return {
      products,
      categories,
      flashSaleProducts: products.filter((p) => p.isFlashSale),
      hotDealProducts: products.filter((p) => p.isHotDeal),
      dinajpurProducts: products.filter((p) => p.category === 'dinajpur-licu'),
      premiumProducts: products.filter((p) => p.category === 'premium-licu'),
      heroBanners,
      promoBanners,
      loading,
      error,
      refresh,
    };
  }, [products, categories, heroBanners, promoBanners, loading, error]);

  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used inside SiteDataProvider');
  }
  return context;
}
