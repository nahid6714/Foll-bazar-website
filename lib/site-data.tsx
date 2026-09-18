'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabaseRest } from '@/lib/supabase';
import { Product } from '@/lib/data';

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
  // True until the real catalogue has been successfully loaded from
  // Supabase at least once. No demo/placeholder content is ever shown in
  // its place — the UI must keep showing a skeleton while this is true.
  loading: boolean;
  // True while a retry attempt is in flight after an earlier failed load.
  retrying: boolean;
  // How many failed attempts have happened since the last success.
  retryCount: number;
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

// Fetches the full catalogue (products, categories, banners) in one shot.
// Throws if any required piece (products/categories) fails — banners alone
// are allowed to come back empty since they're not required to show
// products.
async function fetchCatalogue() {
  const [productsResult, categoriesResult] = await Promise.all([
    fetchProductsWithStock(),
    supabaseRest<any[]>(
      'categories?select=id,name,slug,image_url,sort_order&is_active=eq.true&order=sort_order.asc'
    ),
  ]);

  let bannersResult: any[] = [];
  try {
    bannersResult = await supabaseRest<any[]>(
      'site_banners?select=id,banner_type,image_url,alt_text,sort_order,link_url&is_active=eq.true&order=banner_type.asc,sort_order.asc'
    );
  } catch (bannerError) {
    // Banners are decorative; if the table isn't reachable, carry on with
    // an empty banner list rather than failing the whole page load.
    console.warn('Supabase banner table is unavailable.', bannerError);
    bannersResult = [];
  }

  const products = (productsResult ?? []).map(toProduct);
  const categories = (categoriesResult ?? []).map((row: any) => ({
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    icon: String(row.image_url ?? ''),
    hasSubmenu: false,
  }));

  const liveBanners = (bannersResult ?? []).filter((row: any) => String(row.image_url ?? '').trim());
  const mappedBanners = liveBanners.map((row: any, index: number) => ({
    id: String(row.id ?? index),
    image: String(row.image_url ?? '').trim(),
    alt: String(row.alt_text ?? 'ফল বাজার ব্যানার'),
    type: (String(row.banner_type) === 'promo' ? 'promo' : 'hero') as 'hero' | 'promo',
    sortOrder: Number(row.sort_order ?? index),
    linkUrl: row.link_url ? String(row.link_url) : null,
  }));

  return {
    products,
    categories,
    heroBanners: mappedBanners.filter((b) => b.type === 'hero'),
    promoBanners: mappedBanners.filter((b) => b.type === 'promo'),
  };
}

// Auto-retry backoff schedule (ms) used when the live catalogue fails to
// load. There is no demo/placeholder fallback: on failure we simply wait
// and try again, and the UI stays on its loading skeleton the whole time.
const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000];

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  // No demo/placeholder catalogue is ever loaded into state. `loading`
  // stays true — and the homepage/shop keep showing their skeletons —
  // until the real Supabase data has actually arrived. On failure we
  // retry automatically instead of ever substituting bundled sample data.
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [heroBanners, setHeroBanners] = useState<SiteBanner[]>([]);
  const [promoBanners, setPromoBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptIdRef = useRef(0);

  const applyCatalogue = (data: { products: Product[]; categories: SiteCategory[]; heroBanners: SiteBanner[]; promoBanners: SiteBanner[] }) => {
    setProducts(data.products);
    setCategories(data.categories);
    setHeroBanners(data.heroBanners);
    setPromoBanners(data.promoBanners);
  };

  const load = async ({ isManualRefresh }: { isManualRefresh: boolean }) => {
    const attemptId = ++attemptIdRef.current;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (isManualRefresh) {
      setLoading(true);
    }
    setError(null);

    let attempt = 0;
    while (attemptIdRef.current === attemptId) {
      try {
        const data = await fetchCatalogue();
        if (attemptIdRef.current !== attemptId) return; // a newer load superseded this one
        applyCatalogue(data);
        setError(null);
        setRetryCount(0);
        setRetrying(false);
        setLoading(false);
        return;
      } catch (err) {
        if (attemptIdRef.current !== attemptId) return;
        attempt += 1;
        console.warn(`Supabase catalogue load failed (attempt ${attempt}); retrying — no demo data will be shown.`, err);
        setError(err instanceof Error ? err.message : 'Supabase data load failed');
        setRetryCount(attempt);
        setRetrying(true);
        // Loading (i.e. skeleton) stays true the entire time — real
        // products/categories/prices are only ever shown once a live
        // fetch actually succeeds.
        const delay = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
        await new Promise<void>((resolve) => {
          retryTimerRef.current = setTimeout(resolve, delay);
        });
      }
    }
  };

  const refresh = async () => {
    await load({ isManualRefresh: true });
  };

  useEffect(() => {
    load({ isManualRefresh: false });
    return () => {
      // Invalidate any in-flight attempt/retry so it can't set state after unmount.
      attemptIdRef.current += 1;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<SiteDataContextValue>(() => {

    // The database is the source of truth. These flags are encoded in the
    // product rows; use the current catalogue for all product sections.
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
      retrying,
      retryCount,
      error,
      refresh,
    };
  }, [products, categories, heroBanners, promoBanners, loading, retrying, retryCount, error]);

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
