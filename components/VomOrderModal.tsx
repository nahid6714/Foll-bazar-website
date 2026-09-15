'use client';

import React, { useState } from 'react';
import { Product, CartItem } from '@/lib/data';

interface VomOrderModalProps {
  isOpen: boolean;
  product: Product | null;
  cartItems: CartItem[];
  onClose: () => void;
  onSuccess: (orderData: {
    orderId: string;
    items: { title: string; price: number; quantity: number }[];
    name: string;
    phone: string;
    address: string;
    deliveryArea: string;
    deliveryFee: number;
    subtotal: number;
    grandTotal: number;
  }) => void;
}

export default function VomOrderModal({
  isOpen,
  product,
  cartItems,
  onClose,
  onSuccess,
}: VomOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate pricing
  const isCartCheckout = !product && cartItems.length > 0;
  const singlePrice = product ? parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const subtotal = isCartCheckout
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : singlePrice * quantity;
  const deliveryFee = deliveryArea === 'dhaka' ? 80 : 150;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা দিন।');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const randomId = 'FB-' + Math.floor(10000 + Math.random() * 90000);

    const itemsSummary = isCartCheckout
      ? cartItems.map((c) => ({ title: c.title, price: c.price, quantity: c.quantity }))
      : [
          {
            title: product?.title || 'লিচু',
            price: singlePrice,
            quantity: quantity,
          },
        ];

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        orderId: randomId,
        items: itemsSummary,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryArea: deliveryArea === 'dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে',
        deliveryFee,
        subtotal,
        grandTotal,
      });
      onClose();
    }, 800);
  };

  return (
    <>
      <div className={`vom-overlay ${isOpen ? 'open' : ''}`} id="vomOverlay" onClick={onClose}></div>
      <div
        className={`vom-modal ${isOpen ? 'open' : ''}`}
        id="vomModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vomTitle"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          maxWidth: '560px',
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          padding: '24px',
        }}
      >
        <button
          type="button"
          className="vom-close"
          id="vomClose"
          aria-label="বন্ধ করুন"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f3f4f6',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4b5563',
          }}
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="vom-content" id="vomContent">
          <h2
            id="vomTitle"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-bolt" style={{ color: '#df2d4d' }}></i>
            <span>অর্ডার সম্পন্ন করতে তথ্য দিন</span>
          </h2>

          {/* Item Preview */}
          {product ? (
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                backgroundColor: '#fafafa',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.title}
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                  {product.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#df2d4d' }}>৳{product.price}</span>
                  {product.oldPrice && (
                    <del style={{ fontSize: '13px', color: '#9ca3af' }}>৳{product.oldPrice}</del>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px', backgroundColor: '#fafafa', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                কার্ট আইটেমস ({cartItems.length} টি):
              </div>
              {cartItems.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    padding: '4px 0',
                    borderBottom: '1px dashed #e5e7eb',
                  }}
                >
                  <span>
                    {c.title} x {c.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>৳{c.price * c.quantity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                আপনার নাম <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: মোঃ সাকিব হাসান"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                মোবাইল নম্বর <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="যেমন: 017xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                সম্পূর্ণ ডেলিভারি ঠিকানা <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                placeholder="বাসা নং, রোড নং, এলাকা, থানা, জেলা"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Delivery Charge Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                ডেলিভারি এলাকা নির্বাচন করুন:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `2px solid ${deliveryArea === 'dhaka' ? '#df2d4d' : '#e5e7eb'}`,
                    backgroundColor: deliveryArea === 'dhaka' ? '#fff5f6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'dhaka'}
                    onChange={() => setDeliveryArea('dhaka')}
                    style={{ accentColor: '#df2d4d' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>ঢাকার ভিতরে</div>
                    <div style={{ color: '#df2d4d', fontWeight: 700 }}>৳৮০</div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `2px solid ${deliveryArea === 'outside' ? '#df2d4d' : '#e5e7eb'}`,
                    backgroundColor: deliveryArea === 'outside' ? '#fff5f6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'outside'}
                    onChange={() => setDeliveryArea('outside')}
                    style={{ accentColor: '#df2d4d' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>ঢাকার বাইরে</div>
                    <div style={{ color: '#df2d4d', fontWeight: 700 }}>৳১৫০</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                বিশেষ কোনো নির্দেশনা (অপশনাল)
              </label>
              <input
                type="text"
                placeholder="যেমন: বিকেলে ডেলিভারি করবেন..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Price Breakdown */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                <span>পণ্যের মূল্য</span>
                <span>৳{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>
                <span>ডেলিভারি চার্জ</span>
                <span>৳{deliveryFee}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#111827',
                  paddingTop: '8px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <span>সর্বমোট পরিশোধ</span>
                <span style={{ color: '#df2d4d' }}>৳{grandTotal}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '6px', textAlign: 'center' }}>
                <i className="fas fa-money-bill-wave" style={{ marginRight: '4px' }}></i>
                ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন)
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#df2d4d',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(223,45,77,0.3)',
                transition: 'background 0.2s',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="load-more-spinner" style={{ display: 'inline-block', width: '16px', height: '16px' }}></span>
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  <span>অর্ডার কনফার্ম করুন (৳{grandTotal})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
