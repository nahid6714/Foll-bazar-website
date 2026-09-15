'use client';

import React from 'react';
import { hotDealProducts, Product } from '@/lib/data';
import ProductCard from './ProductCard';

interface HotDealSectionProps {
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function HotDealSection({ onOrderProduct, onAddToCart }: HotDealSectionProps) {
  return (
    <section className="hot-deal-section">
      <div className="container">
        <div className="hot-deal-header">
          <div className="hot-deal-title-wrap">
            <h2 className="hot-deal-title">
              <i className="fas fa-fire" aria-hidden="true"></i>
              <span>Hot Deal</span>
            </h2>
            <span className="hot-deal-subtitle">সেরা ডিল — সীমিত সময়ের জন্য!</span>
          </div>

          <a
            href="#allProducts"
            className="hot-deal-view-all"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('allProducts');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>সব দেখুন</span>
            <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>

        <div className="hot-deal-grid product-grid">
          {hotDealProducts.map((p) => (
            <ProductCard
              key={'hot-' + p.id + '-' + p.title}
              product={p}
              onOrderProduct={onOrderProduct}
              onAddToCart={onAddToCart}
              showProgress={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
