'use client';

import React, { useState } from 'react';
import { trackPublicOrder } from '@/lib/orders';
import { ArrowLeft, Search, Truck, CheckCircle2, PackageCheck, MapPin } from 'lucide-react';

interface OrderTrackViewProps {
  onBack: () => void;
}

export default function OrderTrackView({ onBack }: OrderTrackViewProps) {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [trackResult, setTrackResult] = useState<{
    id: string;
    status: string;
    stage: number;
    total: number;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTrackResult(null);

    const orderNumber = orderIdInput.trim();
    const phone = phoneInput.trim();
    if (!orderNumber && !phone) {
      setError('অর্ডার আইডি অথবা মোবাইল নম্বর দিন।');
      return;
    }

    setLoading(true);
    try {
      const result = await trackPublicOrder({ orderNumber, phone });
      if (!result) {
        setError('এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি। অর্ডারের সময় ব্যবহৃত মোবাইল নম্বরটি ঠিকভাবে দিন।');
        return;
      }

      setTrackResult({
        id: result.order_number,
        status: result.status,
        stage: statusStage(result.status),
        total: Number(result.total_amount ?? 0),
        createdAt: result.created_at,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অর্ডার ট্র্যাক করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const statusText = trackResult ? statusLabel(trackResult.status) : '';
  const stage = trackResult?.stage ?? 0;

  return (
    <div className="order-track-page bg-[#f8f9fa] min-h-[75vh] pb-16">
      <section className="order-track-hero">
        <div className="container mx-auto px-4 text-center">
          <Truck className="mx-auto mb-2 h-9 w-9" />
          <h1>অর্ডার ট্র্যাকিং</h1>
          <p>অর্ডার আইডি অথবা অর্ডার করার মোবাইল নম্বর দিয়ে ডেলিভারি স্ট্যাটাস দেখুন</p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-1">
        <div className="order-track-card">
          <div className="flex items-center justify-between gap-3 mb-6">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#df2d4d]">
              <ArrowLeft className="w-4 h-4" />
              হোমে ফিরুন
            </button>
            <span className="hidden sm:block text-xs text-gray-400">সরাসরি Supabase থেকে তথ্য</span>
          </div>

          <form onSubmit={handleTrack} className="order-track-form">
            <label htmlFor="order-tracking-input">অর্ডার আইডি (Invoice ID)</label>
            <div className="order-track-input-wrap">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                id="order-tracking-input"
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="যেমন: FB-54321"
                autoComplete="off"
              />
            </div>

            <div className="order-track-or">অথবা</div>

            <label htmlFor="order-tracking-phone">অর্ডার করার মোবাইল নম্বর</label>
            <div className="order-track-input-wrap">
              <span className="text-gray-400 text-lg">☎</span>
              <input
                id="order-tracking-phone"
                type="tel"
                inputMode="numeric"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                aria-label="অর্ডার করার মোবাইল নম্বর"
              />
            </div>

            {error && <p className="order-track-error" role="alert">{error}</p>}

            <button type="submit" className="order-track-submit" disabled={loading}>
              <Search className="w-5 h-5" />
              {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">অর্ডার দেওয়ার সময় যে নম্বর ব্যবহার করেছিলেন, সেটিই দিন।</p>
          </form>
        </div>

        {trackResult && (
          <div className="order-track-result">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
              <div>
                <p className="text-xs text-gray-400">অর্ডার আইডি</p>
                <h2 className="text-lg font-bold text-gray-900">{trackResult.id}</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">{statusText}</span>
            </div>

            <div className="order-track-summary">
              <span>অর্ডারের তারিখ: <strong>{formatDate(trackResult.createdAt)}</strong></span>
              <span>মোট: <strong>৳{trackResult.total.toFixed(2)}</strong></span>
            </div>

            <div className="order-track-steps">
              {[
                ['অর্ডার গৃহীত', 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে', CheckCircle2, 1],
                ['প্রস্তুত / প্যাকিং', 'পণ্য প্রস্তুত ও প্যাক করা হচ্ছে', PackageCheck, 2],
                ['কুরিয়ারে পাঠানো হয়েছে', 'আপনার অর্ডার ডেলিভারির পথে', Truck, 3],
                ['ডেলিভারি সম্পন্ন', 'পণ্য আপনার কাছে পৌঁছে দেওয়া হয়েছে', MapPin, 4],
              ].map(([title, description, Icon, step]) => {
                const stepNumber = Number(step);
                const done = stage >= stepNumber;
                const active = stage === stepNumber;
                const IconComponent = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={String(title)} className={`order-track-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <span><IconComponent className="w-5 h-5" /></span>
                    <div><strong>{String(title)}</strong><small>{String(description)}</small></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeOrderStatus(status: string) {
  return String(status || '').trim().toLowerCase();
}

function statusStage(status: string) {
  switch (normalizeOrderStatus(status)) {
    case 'delivered': return 4;
    case 'out_for_delivery': return 3;
    case 'shipped': return 3;
    case 'packed': return 2;
    case 'processing': return 2;
    case 'confirmed': return 1;
    case 'cancelled': return 1;
    case 'returned': return 4;
    default: return 1;
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'অর্ডার গ্রহণ করা হয়েছে',
    confirmed: 'অর্ডার কনফার্মড',
    processing: 'অর্ডার প্রস্তুত হচ্ছে',
    packed: 'অর্ডার প্যাক করা হয়েছে',
    shipped: 'কুরিয়ারে পাঠানো হয়েছে',
    out_for_delivery: 'ডেলিভারির পথে',
    delivered: 'ডেলিভারি সম্পন্ন',
    cancelled: 'অর্ডার বাতিল',
    returned: 'অর্ডার ফেরত হয়েছে',
  };
  return labels[normalizeOrderStatus(status)] || 'অর্ডার আপডেট হয়েছে';
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}
