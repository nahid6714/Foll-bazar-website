'use client';

import React from 'react';
import { Product } from '@/lib/data';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  id?: string;
  title: string;
  products: Product[];
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function CategorySection({
  id,
  title,
  products,
  onOrderProduct,
  onAddToCart,
}: CategorySectionProps) {
  return (
    <section className="product-section" id={id}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <a
            href="#allProducts"
            className="section-view-all"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('allProducts');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            সব দেখুন
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>

        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={`${id || 'cat'}-${p.id}-${p.title}`}
              product={p}
              onOrderProduct={onOrderProduct}
              onAddToCart={onAddToCart}
              showProgress={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
