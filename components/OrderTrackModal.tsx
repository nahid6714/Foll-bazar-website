'use client';

import React, { useState } from 'react';

interface OrderTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackModal({ isOpen, onClose }: OrderTrackModalProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackResult, setTrackResult] = useState<{
    id: string;
    customer: string;
    items: string;
    status: string;
    stage: number;
    eta: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    setHasSearched(true);
    // Generate realistic status
    setTrackResult({
      id: trackingInput.startsWith('#') ? trackingInput : `#FB-${trackingInput.slice(-5) || '92415'}`,
      customer: 'গ্রাহক',
      items: 'দিনাজপুরের বিখ্যাত ফ্রেশ লিচু প্যাক',
      status: 'কুরিয়ারে ডেলিভারির জন্য পাঠানো হয়েছে',
      stage: 3,
      eta: 'আগামীকাল বিকেল ৫:০০ টার মধ্যে',
    });
  };

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
          maxWidth: '480px',
          width: '92%',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          type="button"
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

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-truck-fast" style={{ color: '#df2d4d' }}></i>
          <span>অর্ডার ট্র্যাকিং</span>
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          আপনার অর্ডার আইডি অথবা অর্ডার করার মোবাইল নম্বরটি লিখুন।
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="অর্ডার আইডি (যেমন: FB-89241) বা মোবাইল নম্বর"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#df2d4d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0 18px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            সার্চ
          </button>
        </form>

        {hasSearched && trackResult && (
          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>অর্ডার: {trackResult.id}</span>
              <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {trackResult.status}
              </span>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  ✓
                </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>অর্ডার গৃহীত হয়েছে ও কনফার্মড</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  ✓
                </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>বাগান থেকে ফ্রেশ লিচু প্যাকিং সম্পন্ন</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#df2d4d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  <i className="fas fa-truck"></i>
                </span>
                <span style={{ fontWeight: 700, color: '#df2d4d' }}>কুরিয়ারে ডেলিভারির জন্য রওয়ানা হয়েছে</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: 0.5 }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></span>
                <span>ডেলিভারি সম্পন্ন</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#4b5563', borderTop: '1px dashed #d1d5db', paddingTop: '10px' }}>
              সম্ভাব্য ডেলিভারি সময়: <strong>{trackResult.eta}</strong>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
