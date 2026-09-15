'use client';

import React, { useState } from 'react';
import { allProductsList, Product } from '@/lib/data';
import ProductCard from './ProductCard';

interface AllProductsSectionProps {
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function AllProductsSection({ onOrderProduct, onAddToCart }: AllProductsSectionProps) {
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount((prev) => {
        const next = prev + 5;
        if (next >= allProductsList.length) {
          setHasMore(false);
        }
        return next;
      });
      setIsLoading(false);
    }, 600);
  };

  const visibleProducts = allProductsList.slice(0, displayedCount);

  return (
    <section className="product-section" id="allProducts">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">সকল প্রোডাক্ট</h2>
        </div>

        <div className="product-grid" id="all-product-grid">
          {visibleProducts.map((p, idx) => (
            <ProductCard
              key={`all-${idx}-${p.id}-${p.title}`}
              product={p}
              onOrderProduct={onOrderProduct}
              onAddToCart={onAddToCart}
              showProgress={false}
            />
          ))}
        </div>

        {hasMore && (
          <div className="all-product-load-more" id="allProductLoadMoreWrapper">
            <button
              type="button"
              className="btn-all-product-load-more"
              id="btnAllProductLoadMore"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              <span>{isLoading ? 'লোড হচ্ছে...' : 'লোড মোর'}</span>
              {isLoading && <span className="load-more-spinner" aria-hidden="true" style={{ display: 'inline-block' }}></span>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
