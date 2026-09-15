'use client';

import React from 'react';

interface OrderSuccessData {
  orderId: string;
  items: { title: string; price: number; quantity: number }[];
  name: string;
  phone: string;
  address: string;
  deliveryArea: string;
  deliveryFee: number;
  subtotal: number;
  grandTotal: number;
}

interface OrderSuccessModalProps {
  order: OrderSuccessData | null;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  if (!order) return null;

  return (
    <>
      <div className="vom-overlay open" onClick={onClose} style={{ zIndex: 999998 }}></div>
      <div
        className="vom-modal open"
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          maxWidth: '500px',
          width: '92%',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <i className="fas fa-check"></i>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          অর্ডার সফলভাবে সম্পন্ন হয়েছে!
        </h2>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
          ধন্যবাদ <strong>{order.name}</strong>, আপনার অর্ডারটি আমরা গ্রহণ করেছি।
        </p>

        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'left',
            marginBottom: '18px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>অর্ডার আইডি:</span>
            <strong style={{ color: '#df2d4d', fontSize: '14px' }}>#{order.orderId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#6b7280' }}>মোবাইল নম্বর:</span>
            <span>{order.phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#6b7280' }}>ডেলিভারি ঠিকানা:</span>
            <span style={{ maxWidth: '60%', textAlign: 'right' }}>{order.address}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#6b7280' }}>এলাকা:</span>
            <span>{order.deliveryArea} (৳{order.deliveryFee})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '15px', fontWeight: 700 }}>
            <span>সর্বমোট মূল্য:</span>
            <span style={{ color: '#df2d4d' }}>৳{order.grandTotal}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
          <i className="fas fa-truck" style={{ marginRight: '6px' }}></i>
          আমাদের প্রতিনিধি দ্রুত আপনার সাথে ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন।
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: '#df2d4d',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ঠিক আছে, বন্ধ করুন
        </button>
      </div>
    </>
  );
}
