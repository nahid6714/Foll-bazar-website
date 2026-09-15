'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabaseRest } from '@/lib/supabase';
import {
  Product,
  categories as fallbackCategories,
  allProductsList as fallbackProducts,
} from '@/lib/data';

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
    image: String(row.image_url ?? ''),
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
  };
}

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<SiteCategory[]>(
    fallbackCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      hasSubmenu: c.hasSubmenu,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabaseRest<any[]>(
          'products?select=id,legacy_id,name,slug,image_url,old_price,price,sold_quantity,discount_percent,is_featured,is_flash_sale,is_hot_deal,sort_order,category_id,categories(name,slug)&is_active=eq.true&order=sort_order.asc'
        ),

        supabaseRest<any[]>(
          'categories?select=id,name,slug,image_url,sort_order&is_active=eq.true&order=sort_order.asc'
        ),
      ]);

      const liveProducts = (productsResult ?? []).map(toProduct);

      if (liveProducts.length > 0) {
        setProducts(liveProducts);
      }

      const liveCategories = (categoriesResult ?? []).map((row: any) => ({
        name: String(row.name ?? ''),
        slug: String(row.slug ?? ''),
        icon: String(row.image_url ?? ''),
        hasSubmenu: false,
      }));

      if (liveCategories.length > 0) {
        setCategories(liveCategories);
      }
    } catch (err) {
      console.warn('Supabase catalogue load failed; using local fallback data.', err);
      setError(err instanceof Error ? err.message : 'Supabase data load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
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
      loading,
      error,
      refresh,
    };
  }, [products, categories, loading, error]);

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
