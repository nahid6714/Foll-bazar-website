export interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  oldPrice: string | null;
  soldText?: string | null;
  progressWidth?: string | null;
  discount?: string | null;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isHotDeal?: boolean;
  category?: string;
  categoryName?: string;
  slug?: string;
  stock?: number;
  description?: string | null;
}

export interface CartItem {
  /** Canonical Supabase product id; id may include a variant suffix. */
  productId?: string;
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice?: number | null;
  quantity: number;
  /** Base 1kg price used to safely recalculate the selected package size. */
  basePrice?: number;
  baseOldPrice?: number | null;
  variant?: string;
}


// NOTE: This project intentionally does NOT ship a demo/placeholder product
// catalogue. All products, categories, and banners come exclusively from
// Supabase at runtime (see lib/site-data.tsx). If the live data fails to
// load, the UI retries automatically and keeps showing a loading skeleton —
// it never substitutes sample/demo content.
