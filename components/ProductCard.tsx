'use client';

import React from 'react';
import { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  showProgress?: boolean;
}

export default function ProductCard({
  product,
  onOrderProduct,
  onAddToCart,
  showProgress = false,
}: ProductCardProps) {
  // Determine discount badge
  let discountText = product.discount || null;
  if (!discountText && product.oldPrice && product.price) {
    const oldP = parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10);
    const newP = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
    if (oldP > newP && oldP > 0) {
      const pct = Math.round(((oldP - newP) / oldP) * 100);
      if (pct > 0) {
        discountText = `${pct}% ছাড়`;
      }
    }
  }

  return (
    <article
      className="product-card vom-card"
      data-id={product.id}
      data-title={product.title}
      data-price={product.price}
      data-image={product.image}
    >
      <div className="product-thumb">
        {discountText && (
          <span className="deal-badge">{discountText}</span>
        )}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOrderProduct(product);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.title}
            className="product-thumb-img"
            loading="lazy"
          />
        </a>
      </div>

      <div className="product-body">
        <h3 className="product-title">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOrderProduct(product);
            }}
          >
            {product.title}
          </a>
        </h3>

        <p className="product-price">
          {product.oldPrice && <del>৳{product.oldPrice}</del>} ৳{product.price}
        </p>

        {showProgress && product.soldText && (
          <div className="flash-sold-wrap">
            <div className="flash-progress-track">
              <div
                className="flash-progress-bar"
                style={{ width: `${product.progressWidth || 10}%` }}
              ></div>
            </div>
            <span className="flash-sold-text">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#f97316"
                stroke="#f97316"
                strokeWidth="1"
                aria-hidden="true"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>{product.soldText}</span>
            </span>
          </div>
        )}

        <div className="product-actions">
          <button
            type="button"
            className="btn-order vom-btn"
            data-id={product.id}
            data-title={product.title}
            data-price={product.price}
            data-image={product.image}
            onClick={() => onOrderProduct(product)}
          >
            <span>অর্ডার করুন</span>
          </button>

          <button
            type="button"
            className="btn-cart add-to-cart"
            aria-label="কার্টে যোগ করুন"
            data-id={product.id}
            onClick={() => onAddToCart(product)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
