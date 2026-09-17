'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/data';
import { useSiteData } from '@/lib/site-data';
import ProductCard from './ProductCard';
import {
  Star,
  ShoppingCart,
  Zap,
  Share2,
  MessageSquare,
  X,
  Play,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailsViewProps {
  product: Product;
  onBackToHome: () => void;
  onNavigateToCategory?: (categorySlug: string) => void;
  onViewProductDetails: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, variant?: string) => void;
  onOrderProduct: (product: Product, quantity?: number, variant?: string) => void;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export default function ProductDetailsView({
  product,
  onBackToHome,
  onNavigateToCategory,
  onViewProductDetails,
  onAddToCart,
  onOrderProduct,
}: ProductDetailsViewProps)
  {
  const { products: allProductsList } = useSiteData();

  // Use only the image currently stored on the product record.
  // Never append legacy/demo images to a newly uploaded Cloudinary image.
  const defaultGallery = useMemo(() => {
    const imageUrl = String(product.image ?? '').trim();
    return imageUrl ? [imageUrl] : [];
  }, [product.image]);

  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Package size / variant selection
  const variants = ['১ কেজি', '২ কেজি', '৫০০ গ্রাম'];
  const [selectedVariant, setSelectedVariant] = useState<string>('১ কেজি');


  // Quantity selection
  const [quantity, setQuantity] = useState<number>(1);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // Share feedback toast
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Numeric prices
  const basePrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 1300;
  const baseOldPrice = product.oldPrice
    ? parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10)
    : 1200;

  // Compute price multiplier for variant
  const variantMultiplier = useMemo(() => {
    if (selectedVariant === '৫০০ গ্রাম') return 0.5;
    if (selectedVariant === '২ কেজি') return 2.0;
    return 1.0;
  }, [selectedVariant]);

  const currentPrice = Math.round(basePrice * variantMultiplier);
  const currentOldPrice = baseOldPrice ? Math.round(baseOldPrice * variantMultiplier) : null;

  // Code generator
  const productCode = `P0${product.id.padStart(3, '0')}`;
  const categoryName = product.categoryName || 'প্রিমিয়াম লিচু';
  const categorySlug = product.category || 'premium-licu';
  const stock = Number(product.stock ?? 0);
  const hasStockData = product.stock !== undefined;
  const isOutOfStock = hasStockData && stock <= 0;

  // Average review rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  // Related products (exclude current product)
  const relatedProducts = useMemo(() => {
    return allProductsList.filter((p) => p.id !== product.id).slice(0, 4);
  }, [allProductsList, product.id]);

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: Date.now().toString(),
      name: newReviewName.trim(),
      rating: newReviewRating,
      date: new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
      comment: newReviewComment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setNewReviewName('');
    setNewReviewComment('');
    setReviewSubmitSuccess(true);
    setTimeout(() => {
      setReviewSubmitSuccess(false);
      setIsReviewModalOpen(false);
    }, 1200);
  };

  // Social Share handler
  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${product.title} - ফল বাজার থেকে খাঁটি মানের লিচু কিনুন!`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast('লিংক কপি করা হয়েছে!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <div className="product-details-container w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6">
      {/* 1. Breadcrumb Navigation (Exact match for Screenshot 5) */}
      <nav aria-label="ব্রেডক্রাম্ব" className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-600 mb-4 pb-2 border-b border-gray-100">
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-[#df2d4d] transition-colors font-medium flex items-center gap-1"
        >
          হোম
        </button>
        <span className="text-gray-300">/</span>
        <button
          type="button"
          onClick={() => {
            if (onNavigateToCategory) {
              onNavigateToCategory(categorySlug);
            } else {
              onBackToHome();
            }
          }}
          className="hover:text-[#df2d4d] transition-colors font-medium"
        >
          {categoryName}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* Main Product Layout: Image Gallery on Left/Top, Info on Right/Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-10">
        {/* LEFT COLUMN: Media Gallery (Exact match for Screenshot 5) */}
        <div className="media-gallery flex flex-col gap-3">
          {/* Main Large Display */}
          <div className="main-image-wrapper relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs flex items-center justify-center">
            {isVideoActive ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="বাগান থেকে সরাসরি তাজা লিচু সংগ্রহ"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button
                  type="button"
                  onClick={() => setIsVideoActive(false)}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10 transition-colors"
                  aria-label="ভিডিও বন্ধ করুন"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={defaultGallery[activeMediaIndex] || product.image}
                alt={product.title}
                className="w-full h-full object-cover select-none transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>

          {/* Thumbnails Row (4 Photos + 1 Video thumbnail as in Screenshot 5 & 4) */}
          <div className="thumbnails-row flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 no-scrollbar">
            {defaultGallery.map((imgSrc, idx) => {
              const isSelected = !isVideoActive && activeMediaIndex === idx;
              return (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => {
                    setIsVideoActive(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    isSelected
                      ? 'border-[#df2d4d] shadow-sm scale-102 ring-2 ring-[#df2d4d]/30'
                      : 'border-gray-200 opacity-80 hover:opacity-100 hover:border-gray-300'
                  }`}
                  aria-label={`ছবি ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={`${product.title} থাম্বনেইল ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}

            {/* Video Thumbnail (Matching Screenshot 5: sapling/orchard video with play icon) */}
            <button
              type="button"
              onClick={() => {
                setIsVideoModalOpen(true);
              }}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 group transition-all ${
                isVideoActive
                  ? 'border-[#df2d4d] ring-2 ring-[#df2d4d]/30'
                  : 'border-gray-200 opacity-90 hover:opacity-100'
              }`}
              aria-label="ভিডিও দেখুন"
            >
              {/* Use the current product image so no legacy product photo is shown. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt="ভিডিও থাম্বনেইল"
                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition-all"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15">
                <div className="w-8 h-8 rounded-full bg-white/95 text-[#df2d4d] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play size={15} className="fill-[#df2d4d] translate-x-0.5" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information (Exact match for Screenshot 4 & 3) */}
        <div className="product-info-column flex flex-col gap-4">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>

          {/* Rating Summary (Stars + Review count) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <a
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('reviews-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm text-gray-500 hover:text-[#df2d4d] transition-colors"
            >
              ({reviews.length} রিভিউ)
            </a>
          </div>

          {/* Specifications Box (Matching Screenshot 4) */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200/80 p-3 sm:p-4 text-xs sm:text-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-600 font-medium">ক্যাটাগরি:</span>
              <span className="text-gray-900 font-semibold">{categoryName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-600 font-medium">কোড:</span>
              <span className="text-gray-800 font-mono font-bold tracking-wide">{productCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">স্টক:</span>
              <span className={`flex items-center gap-1 font-semibold ${isOutOfStock ? 'text-gray-500' : 'text-[#16a34a]'}`}>
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] ${isOutOfStock ? 'bg-gray-500' : 'bg-[#16a34a]'}`}>
                  {isOutOfStock ? '×' : '✓'}
                </span>
                {isOutOfStock ? 'স্টক নেই' : hasStockData ? `স্টকে আছে (${stock})` : 'স্টক তথ্য পাওয়া যায়নি'}
              </span>
            </div>
          </div>

          {/* Price Display (Screenshot 4) */}
          <div className="flex items-baseline gap-3 my-1">
            {currentOldPrice && (
              <del className="text-lg sm:text-xl text-gray-400 font-semibold">
                ৳{currentOldPrice}
              </del>
            )}
            <span className="text-2xl sm:text-3xl font-black text-[#df2d4d]">
              ৳{currentPrice}
            </span>
            {currentOldPrice && currentOldPrice > currentPrice && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-[#df2d4d] rounded-md">
                {Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}% ছাড়
              </span>
            )}
          </div>

          {/* Size / Variant Selection (সাইজ / ভ্যারিয়েন্ট নির্বাচন করুন - Screenshot 4) */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-sm font-semibold text-gray-800">
              সাইজ / ভ্যারিয়েন্ট নির্বাচন করুন
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {variants.map((v) => {
                const isSelected = selectedVariant === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)} disabled={isOutOfStock}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                      isSelected
                        ? 'border-[#df2d4d] bg-red-50/50 text-[#df2d4d] font-bold shadow-2xs'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
            {selectedVariant !== '১ কেজি' && (
              <button
                type="button"
                onClick={() => setSelectedVariant('১ কেজি')}
                className="text-xs text-[#df2d4d] underline self-start font-medium hover:text-[#b91c38]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quantity Selection (পরিমাণ - Screenshot 4 & 3) */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-sm font-semibold text-gray-800">পরিমাণ</label>
            <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden w-36 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg active:bg-gray-200 transition-colors"
                aria-label="পরিমাণ কমান"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-gray-900 text-sm sm:text-base select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="w-11 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg active:bg-gray-200 transition-colors"
                aria-label="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now (Exact match for Screenshot 3) */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Add to Cart Button (White with red border and red text) */}
            <button
              type="button"
              onClick={() => onAddToCart(product, Math.min(quantity, stock), selectedVariant)} disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-[#df2d4d] bg-white text-[#df2d4d] font-bold text-sm sm:text-base hover:bg-red-50/50 active:scale-[0.99] transition-all shadow-xs"
            >
              <ShoppingCart size={18} className="stroke-[2.5]" />
              <span>{isOutOfStock ? 'স্টক নেই' : 'Add to Cart'}</span>
            </button>

            {/* Buy Now Button (Solid red with lightning icon) */}
            <button
              type="button"
              onClick={() => onOrderProduct(product, Math.min(quantity, stock), selectedVariant)} disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#df2d4d] text-white font-bold text-sm sm:text-base hover:bg-[#c8233f] active:scale-[0.99] transition-all shadow-sm"
            >
              <Zap size={18} className="fill-white" />
              <span>{isOutOfStock ? 'স্টক নেই' : 'Buy Now'}</span>
            </button>
          </div>

          {/* Social Share (Share: FB, TW, WA - Screenshot 3) */}
          <div className="flex items-center gap-3 pt-2 text-sm text-gray-700">
            <span className="font-semibold text-gray-800">Share:</span>
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleShare('facebook')}
                className="w-8 h-8 rounded-md bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
                aria-label="ফেসবুকে শেয়ার করুন"
                title="ফেসবুক"
              >
                <span className="font-bold text-base font-serif">f</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handleShare('twitter')}
                className="w-8 h-8 rounded-md bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
                aria-label="টুইটারে শেয়ার করুন"
                title="টুইটার"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-8 h-8 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                aria-label="লিংক কপি করুন"
                title="লিংক কপি করুন"
              >
                <Share2 size={14} />
              </button>
            </div>
            {shareToast && <span className="text-xs text-[#16a34a] font-medium">{shareToast}</span>}
          </div>
        </div>
      </div>

      {/* 2. Description Card (Exact match for Screenshot 3 & 2) */}
      <section className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 mb-8 shadow-xs">
        <div className="border-b-2 border-[#df2d4d] inline-block pb-1.5 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Description</h2>
        </div>

        <div className="prose prose-sm sm:prose text-gray-700 leading-relaxed flex flex-col gap-4">
          <p>
            গ্রীষ্মের উষ্ণ দিনে সতেজতার পরশ পেতে চান? আপনার জন্য নিয়ে এসেছি আমাদের বিশেষ সংগ্রহ –{' '}
            <strong className="text-gray-900">{product.title}</strong>! টাটকা বাগান থেকে হাতে তুলে
            আনা এই <strong className="text-gray-900">{categoryName}</strong> আপনার প্রতিটি
            ইন্দ্রিয়কে মুগ্ধ করবে। এর মিষ্টি, রসালো শাঁস আর মন মাতানো সুগন্ধ আপনাকে অন্য জগতে ভাসিয়ে
            নিয়ে যাবে।
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-2">
            কেন বেছে নেবেন আমাদের {product.title}?
          </h3>

          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">অতুলনীয় স্বাদ:</strong> প্রতিটি লিচুতে পাবেন
              প্রাকৃতিক মিষ্টি স্বাদ
            </li>
            <li>
              <strong className="text-gray-900">আকর্ষণীয় গোলাপি রঙ:</strong> এর মন মুগ্ধ করা গোলাপি
              রঙ আপনার প্লেটকে আরও সুন্দর করে তুলবে।
            </li>
            <li>
              <strong className="text-gray-900">পরিবার ও বন্ধুদের জন্য:</strong> গরমের বিকেলে
              পরিবার-বন্ধুদের সাথে উপভোগ করার জন্য আদর্শ। অতিথি আপ্যায়নে কিংবা উপহার হিসেবেও এটি
              অতুলনীয়।
            </li>
          </ul>

          <p className="mt-2 text-gray-800 font-medium">
            স্টক সীমিত! এই গ্রীষ্মে সেরা মানের <strong className="text-[#df2d4d]">{product.title}</strong> এর
            লোভনীয় স্বাদ উপভোগ করার সুযোগ হাতছাড়া করবেন না। এখনই অর্ডার করুন এবং সতেজতার এক নতুন
            অভিজ্ঞতা লাভ করুন!
          </p>
        </div>
      </section>

      {/* 3. Customer Reviews Card (Exact match for Screenshot 2 & 1) */}
      <section id="reviews-section" className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 mb-10 shadow-xs">
        {/* Header: Title on left, Write Review button on right */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">গ্রাহক রিভিউ</h2>
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2 bg-[#df2d4d] hover:bg-[#c8233f] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
          >
            রিভিউ লিখুন
          </button>
        </div>

        {/* Rating Score Card (Screenshot 2) */}
        <div className="bg-gray-50/80 rounded-xl p-5 sm:p-6 mb-6 flex flex-col items-center justify-center text-center border border-gray-100">
          <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-1.5">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 text-amber-400 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < Math.round(Number(averageRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">
            {reviews.length}টি রিভিউ
          </span>
        </div>

        {/* Reviews List / Empty State (Exact match for Screenshot 1) */}
        {reviews.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <MessageSquare size={30} className="stroke-[1.5]" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              এখনো কোনো রিভিউ নেই।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{rev.name}</span>
                  <span className="text-xs text-gray-400">{rev.date}</span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Related Products Section (Exact match for Screenshot 1: | এ জাতীয় আরও পণ্য) */}
      <section className="related-products-section mt-8 mb-12">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-6 bg-[#df2d4d] rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">এ জাতীয় আরও পণ্য</h2>
        </div>

        <div className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {relatedProducts.map((relProduct) => (
            <ProductCard
              key={`related-${relProduct.id}`}
              product={relProduct}
              onOrderProduct={onOrderProduct}
              onAddToCart={onAddToCart}
              onViewDetails={onViewProductDetails}
              showProgress={false}
            />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* REVIEW SUBMISSION MODAL                                                   */}
      {/* ========================================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
              aria-label="বন্ধ করুন"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">রিভিউ লিখুন</h3>
            <p className="text-xs text-gray-500 mb-4">{product.title}</p>

            {reviewSubmitSuccess ? (
              <div className="py-6 text-center text-[#16a34a] font-semibold">
                ✓ আপনার রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    রেটিং দিন
                  </label>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            star <= newReviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#df2d4d]"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    আপনার মতামত বা রিভিউ লিখুন *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="লিচুর স্বাদ, সাইজ এবং ডেলিভারি নিয়ে আপনার অভিজ্ঞতা শেয়ার করুন..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#df2d4d] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#df2d4d] hover:bg-[#c8233f] text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-98"
                >
                  রিভিউ জমা দিন
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIDEO POPUP MODAL (Orchard / Sapling video preview)                        */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10 transition-colors"
              aria-label="ভিডিও বন্ধ করুন"
            >
              <X size={20} />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/5F68v8wUfXo?autoplay=1"
                title="বাগান থেকে সরাসরি তাজা লিচু সংগ্রহ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 bg-[#1e1b1b] text-white">
              <h4 className="font-bold text-sm sm:text-base">
                দিনাজপুরের ঐতিহ্যবাহী বাগান থেকে সরাসরি তাজা লিচু সংগ্রহ
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                শতভাগ খাঁটি ও ক্যামিকেল মুক্ত প্রিমিয়াম লিচু সরাসরি গ্রাহকের দোরগোড়ায়।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
