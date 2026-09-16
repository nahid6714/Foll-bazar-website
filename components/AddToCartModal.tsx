'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Product } from '@/lib/data';

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, variant?: string) => void;
}

export default function AddToCartModal({ product, isOpen, onClose, onConfirm }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const variants = ['৫০০ গ্রাম', '১ কেজি', '২ কেজি'];
  const [variant, setVariant] = useState('১ কেজি');
  const [prevTrackedKey, setPrevTrackedKey] = useState<string | null>(null);

  const currentKey = isOpen ? (product?.id ?? 'open') : null;
  if (currentKey !== prevTrackedKey) {
    setPrevTrackedKey(currentKey);
    if (isOpen) {
      setQuantity(1);
      setVariant('১ কেজি');
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('add-cart-modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('add-cart-modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div className="add-cart-modal-root" role="presentation">
      <button className="add-cart-modal-backdrop" aria-label="বন্ধ করুন" onClick={onClose} />
      <section className="add-cart-modal" role="dialog" aria-modal="true" aria-labelledby="add-cart-title">
        <div className="add-cart-modal-header">
          <h2 id="add-cart-title">পণ্য অর্ডার নির্বাচন করুন</h2>
          <button type="button" className="add-cart-modal-close" onClick={onClose} aria-label="বন্ধ করুন">
            <X size={21} />
          </button>
        </div>

        <div className="add-cart-product">
          <img src={product.image} alt={product.title} />
          <div className="add-cart-product-info">
            <h3>{product.title}</h3>
            <div className="add-cart-price-row">
              <strong>৳{product.price}</strong>
              {product.oldPrice && <del>৳{product.oldPrice}</del>}
            </div>
          </div>
        </div>

        <div className="add-cart-option-label">প্যাকের সাইজ নির্বাচন করুন</div>
        <div className="add-cart-variant-row">
          {variants.map((itemVariant) => (
            <button key={itemVariant} type="button" onClick={() => setVariant(itemVariant)} className={`add-cart-variant-btn ${variant === itemVariant ? 'is-selected' : ''}`}>
              {itemVariant}
            </button>
          ))}
        </div>

        <div className="add-cart-option-label">কতটি প্যাক নিতে চান?</div>
        <div className="add-cart-quantity-row">
          <span>পরিমাণ</span>
          <div className="add-cart-stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="কমান">
              <Minus size={17} />
            </button>
            <strong>{quantity}</strong>
            <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="বাড়ান">
              <Plus size={17} />
            </button>
          </div>
        </div>

        <div className="add-cart-modal-actions">
          <button type="button" className="add-cart-modal-cancel" onClick={onClose}>পরে করব</button>
          <button
            type="button"
            className="add-cart-modal-confirm"
            onClick={() => {
              onConfirm(product, quantity, variant);
              onClose();
            }}
          >
            <ShoppingCart size={18} />
            কার্টে যোগ করুন
          </button>
        </div>
      </section>
    </div>
  );
}
