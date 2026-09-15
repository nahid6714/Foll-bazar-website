'use client';

import React, { useState, useMemo } from 'react';
import { allProductsList, categories, Product } from '@/lib/data';
import ProductCard from './ProductCard';
import { SlidersHorizontal, ChevronDown, X, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ShopViewProps {
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  initialCategory?: string | null;
  onBackToHome?: () => void;
  onViewDetails?: (product: Product) => void;
}

type SortType = 'latest' | 'oldest' | 'price-desc' | 'price-asc' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: 'latest', label: 'নতুন আগে' },
  { id: 'oldest', label: 'পুরানো আগে' },
  { id: 'price-desc', label: 'দাম: বেশি → কম' },
  { id: 'price-asc', label: 'দাম: কম → বেশি' },
  { id: 'name-asc', label: 'নাম: A-Z' },
  { id: 'name-desc', label: 'নাম: Z-A' },
];

// Parse numeric price from product
function getProductPrice(p: Product): number {
  return parseInt(p.price.replace(/[^0-9]/g, ''), 10) || 0;
}

// Check if product has discount
function hasDiscount(p: Product): boolean {
  if (!p.oldPrice) return false;
  const oldP = parseInt(p.oldPrice.replace(/[^0-9]/g, ''), 10) || 0;
  const newP = getProductPrice(p);
  return oldP > newP;
}

export default function ShopView({
  onOrderProduct,
  onAddToCart,
  initialCategory = null,
  onBackToHome,
  onViewDetails,
}: ShopViewProps) {
  // Category state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  // Sorting state
  const [sortOption, setSortOption] = useState<SortType>('latest');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Price range filters
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 3000 });
  const [tempPriceRange, setTempPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 3000 });
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(false);
  const [tempOnlyDiscount, setTempOnlyDiscount] = useState<boolean>(false);
  const [tempCategory, setTempCategory] = useState<string | null>(initialCategory);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return allProductsList.filter((product) => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (product.category !== selectedCategory) {
          return false;
        }
      }

      // Price filter
      const price = getProductPrice(product);
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }

      // Discount filter
      if (onlyDiscount && !hasDiscount(product)) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, priceRange, onlyDiscount]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case 'latest':
        return list.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
      case 'oldest':
        return list.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
      case 'price-desc':
        return list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      case 'price-asc':
        return list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      case 'name-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title, 'bn'));
      case 'name-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title, 'bn'));
      default:
        return list;
    }
  }, [filteredProducts, sortOption]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'all') count++;
    if (priceRange.min > 0 || priceRange.max < 3000) count++;
    if (onlyDiscount) count++;
    return count;
  }, [selectedCategory, priceRange, onlyDiscount]);

  // Current category name
  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const currentCategoryName = currentCategoryObj ? currentCategoryObj.name : 'সকল পণ্য';

  // Selected sort label
  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortOption)?.label || 'নতুন আগে';

  // Apply filters from drawer
  const handleApplyFilter = () => {
    setSelectedCategory(tempCategory);
    setPriceRange(tempPriceRange);
    setOnlyDiscount(tempOnlyDiscount);
    setIsFilterDrawerOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setTempCategory(null);
    setPriceRange({ min: 0, max: 3000 });
    setTempPriceRange({ min: 0, max: 3000 });
    setOnlyDiscount(false);
    setTempOnlyDiscount(false);
    setSortOption('latest');
  };

  // Open drawer with synchronized temporary state
  const handleOpenFilterDrawer = () => {
    setTempCategory(selectedCategory);
    setTempPriceRange(priceRange);
    setTempOnlyDiscount(onlyDiscount);
    setIsFilterDrawerOpen(true);
  };

  return (
    <div className="shop-page-wrapper bg-[#f8f9fa] min-h-[85vh] pb-16 pt-2">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        {/* Category Horizontal Scroll Pills */}
        <div className="mb-3 pt-1 overflow-x-auto scrollbar-none flex items-center gap-2 py-1.5 -mx-1 px-1">
          <button
            type="button"
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-xs border ${
              !selectedCategory || selectedCategory === 'all'
                ? 'bg-[#df2d4d] text-white border-[#df2d4d] shadow-sm font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            সব পণ্য
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-xs border ${
                  isActive
                    ? 'bg-[#df2d4d] text-white border-[#df2d4d] shadow-sm font-semibold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCategory(isActive ? null : cat.slug)}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Breadcrumb & Filter Control Card (Matching Screenshot 1) */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-gray-100 mb-4">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium mb-2.5">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1 hover:text-[#df2d4d] transition-colors"
              title="হোমে ফিরুন"
            >
              <span className="text-base leading-none">🏠</span>
            </button>
            <span className="text-gray-300">/</span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`hover:text-[#df2d4d] transition-colors ${
                !selectedCategory ? 'text-gray-900 font-semibold' : 'text-gray-500'
              }`}
            >
              সকল পণ্য
            </button>
            {selectedCategory && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-[#df2d4d] font-semibold">{currentCategoryName}</span>
              </>
            )}
          </div>

          {/* Bottom Row: Count + Sort Button + Filter Button */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            {/* Count */}
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              {sortedProducts.length > 0 ? `1-${sortedProducts.length}` : '0'} / মোট{' '}
              <strong className="text-gray-900">{allProductsList.length} পণ্য</strong>
            </div>

            {/* Controls: Sort Dropdown Trigger + Filter Button */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown Button */}
              <button
                type="button"
                id="shop-sort-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-2xs"
                onClick={() => setIsSortModalOpen(true)}
                aria-label="বাছাই করার অপশন খুলুন"
              >
                <span>{currentSortLabel}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {/* Filter Button (Red, matching Screenshot 1) */}
              <button
                type="button"
                id="shop-filter-btn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#df2d4d] hover:bg-[#c8233f] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
                onClick={handleOpenFilterDrawer}
                aria-label="ফিল্টার অপশন খুলুন"
              >
                <SlidersHorizontal size={14} />
                <span>ফিল্টার</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-white text-[#df2d4d] text-xs font-bold rounded-full flex items-center justify-center -mr-1 shadow-2xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-white/70 p-2.5 rounded-lg border border-gray-200/80 text-xs">
            <span className="text-gray-500 font-medium">ফিল্টার সক্রিয়:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#df2d4d] border border-red-200 rounded-full font-medium">
                {currentCategoryName}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-red-800 p-0.5"
                  aria-label="ক্যাটাগরি ফিল্টার মুছুন"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {(priceRange.min > 0 || priceRange.max < 3000) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full font-medium">
                ৳{priceRange.min} - ৳{priceRange.max}
                <button
                  type="button"
                  onClick={() => setPriceRange({ min: 0, max: 3000 })}
                  className="hover:text-black p-0.5"
                  aria-label="মূল্য পরিসীমা মুছুন"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {onlyDiscount && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-medium">
                শুধুমাত্র ছাড়
                <button
                  type="button"
                  onClick={() => setOnlyDiscount(false)}
                  className="hover:text-black p-0.5"
                  aria-label="ডিসকাউন্ট ফিল্টার মুছুন"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#df2d4d] hover:underline ml-auto flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={12} />
              সব রিসেট
            </button>
          </div>
        )}

        {/* Product Grid (2 columns on mobile, 3-4 on desktop) */}
        {sortedProducts.length > 0 ? (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {sortedProducts.map((p) => (
              <ProductCard
                key={`shop-${p.id}-${p.title}`}
                product={p}
                onOrderProduct={onOrderProduct}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                showProgress={false}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm my-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-[#df2d4d] flex items-center justify-center">
              <SlidersHorizontal size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              আপনার নির্বাচিত ফিল্টার বা ক্যাটাগরির সাথে মিলে এমন কোনো পণ্য পাওয়া যায়নি। দয়া করে অন্য ফিল্টার চেষ্টা করুন।
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#df2d4d] text-white rounded-xl font-medium text-sm hover:bg-[#c8233f] transition-all shadow-sm"
            >
              <RotateCcw size={16} />
              ফিল্টার রিসেট করুন
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SORTING BOTTOM SHEET MODAL (Exact match for Screenshot 2!)                */}
      {/* ========================================================================= */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="সাজানোর অপশন"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsSortModalOpen(false)}
          />

          {/* Bottom Sheet Container */}
          <div
            className="relative w-full max-w-md bg-[#252120] text-white rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden border-t sm:border border-white/10 animate-in slide-in-from-bottom duration-250"
            style={{ backgroundColor: '#282322' }}
          >
            {/* Top Handle Bar for mobile pull */}
            <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mt-2.5 mb-1" />

            {/* Header with Title & Close button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <span className="text-base font-semibold text-white/90">সাজানোর নিয়ম নির্বাচন করুন</span>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>

            {/* List of Sorting Options (Matching Screenshot 2) */}
            <div className="divide-y divide-white/8 py-1">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSortOption(opt.id);
                      setIsSortModalOpen(false);
                    }}
                  >
                    <span
                      className={`text-base font-medium transition-colors ${
                        isSelected ? 'text-white font-semibold' : 'text-neutral-200 group-hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </span>

                    {/* Radio Indicator (outer circle + filled dot if selected) */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#f87171] bg-[#df2d4d]/20'
                          : 'border-white/40 group-hover:border-white/60'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Safe area padding for mobile bottom bar */}
            <div className="h-6 sm:h-2" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER DRAWER / MODAL ("ফিল্টার")                                         */}
      {/* ========================================================================= */}
      {isFilterDrawerOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="পণ্য ফিল্টার করুন"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#df2d4d] text-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <h3 className="text-base font-bold">পণ্য ফিল্টার</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="ফিল্টার বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span>ক্যাটাগরি সমূহ</span>
                  {tempCategory && (
                    <button
                      type="button"
                      onClick={() => setTempCategory(null)}
                      className="text-xs text-[#df2d4d] font-semibold hover:underline"
                    >
                      মুছুন
                    </button>
                  )}
                </h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all text-left ${
                      !tempCategory || tempCategory === 'all'
                        ? 'bg-red-50 text-[#df2d4d] font-semibold border border-red-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => setTempCategory(null)}
                  >
                    <span>সকল ক্যাটাগরি</span>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {allProductsList.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const isSelected = tempCategory === cat.slug;
                    const catCount = allProductsList.filter((p) => p.category === cat.slug).length;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all text-left ${
                          isSelected
                            ? 'bg-red-50 text-[#df2d4d] font-semibold border border-red-200'
                            : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setTempCategory(isSelected ? null : cat.slug)}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span>মূল্য পরিসীমা (টাকা)</span>
                  <span className="text-xs text-[#df2d4d] font-bold">
                    ৳{tempPriceRange.min} - ৳{tempPriceRange.max}
                  </span>
                </h4>

                {/* Min/Max Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">সর্বনিম্ন (৳)</label>
                    <input
                      type="number"
                      min={0}
                      max={3000}
                      step={50}
                      value={tempPriceRange.min}
                      onChange={(e) =>
                        setTempPriceRange((prev) => ({
                          ...prev,
                          min: Math.max(0, parseInt(e.target.value, 10) || 0),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#df2d4d] focus:border-[#df2d4d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">সর্বোচ্চ (৳)</label>
                    <input
                      type="number"
                      min={0}
                      max={3000}
                      step={50}
                      value={tempPriceRange.max}
                      onChange={(e) =>
                        setTempPriceRange((prev) => ({
                          ...prev,
                          max: Math.max(prev.min, parseInt(e.target.value, 10) || 3000),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#df2d4d] focus:border-[#df2d4d]"
                    />
                  </div>
                </div>

                {/* Range Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'সব দাম', min: 0, max: 3000 },
                    { label: '৳১০০০ এর নিচে', min: 0, max: 1000 },
                    { label: '৳১০০০ - ৳১২৫০', min: 1000, max: 1250 },
                    { label: '৳১২৫০ - ৳১৫০০', min: 1250, max: 1500 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        tempPriceRange.min === preset.min && tempPriceRange.max === preset.max
                          ? 'bg-[#df2d4d] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTempPriceRange({ min: preset.min, max: preset.max })}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount / Offers Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">বিশেষ অফার</h4>
                <label className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors border border-gray-100">
                  <input
                    type="checkbox"
                    checked={tempOnlyDiscount}
                    onChange={(e) => setTempOnlyDiscount(e.target.checked)}
                    className="w-4 h-4 text-[#df2d4d] rounded border-gray-300 focus:ring-[#df2d4d] accent-[#df2d4d]"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      শুধুমাত্র ছাড়যুক্ত পণ্য
                    </span>
                    <span className="text-xs text-gray-500 block">যেসব পণ্যে বিশেষ ছাড় বা ডিসকাউন্ট রয়েছে</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setTempCategory(null);
                  setTempPriceRange({ min: 0, max: 3000 });
                  setTempOnlyDiscount(false);
                }}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                রিসেট
              </button>

              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-[2] py-2.5 px-4 bg-[#df2d4d] hover:bg-[#c8233f] text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
