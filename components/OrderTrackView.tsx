'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Truck, CheckCircle2, PackageCheck, MapPin } from 'lucide-react';

interface OrderTrackViewProps {
  onBack: () => void;
}

export default function OrderTrackView({ onBack }: OrderTrackViewProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackResult, setTrackResult] = useState<{
    id: string;
    status: string;
    eta: string;
  } | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const value = trackingInput.trim();
    if (!value) return;
    setTrackResult({
      id: value.startsWith('#') ? value : `#FB-${value.slice(-5)}`,
      status: 'কুরিয়ারে ডেলিভারির জন্য পাঠানো হয়েছে',
      eta: 'আগামীকাল বিকেল ৫:০০ টার মধ্যে',
    });
  };

  return (
    <div className="order-track-page bg-[#f8f9fa] min-h-[75vh] pb-16">
      <section className="order-track-hero">
        <div className="container mx-auto px-4 text-center">
          <Truck className="mx-auto mb-2 h-9 w-9" />
          <h1>অর্ডার ট্র্যাকিং</h1>
          <p>অর্ডার আইডি অথবা মোবাইল নম্বর দিয়ে ডেলিভারি স্ট্যাটাস দেখুন</p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-1">
        <div className="order-track-card">
          <div className="flex items-center justify-between gap-3 mb-6">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#df2d4d]">
              <ArrowLeft className="w-4 h-4" />
              হোমে ফিরুন
            </button>
            <span className="hidden sm:block text-xs text-gray-400">দ্রুত ও সহজ ট্র্যাকিং</span>
          </div>

          <form onSubmit={handleTrack} className="order-track-form">
            <label htmlFor="order-tracking-input">অর্ডার আইডি (Invoice ID)</label>
            <div className="order-track-input-wrap">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                id="order-tracking-input"
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="যেমন: FB-54321"
              />
            </div>

            <div className="order-track-or">অথবা</div>

            <label htmlFor="order-tracking-phone">মোবাইল নম্বর</label>
            <div className="order-track-input-wrap">
              <span className="text-gray-400 text-lg">☎</span>
              <input
                id="order-tracking-phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                aria-label="মোবাইল নম্বর"
              />
            </div>

            <button type="submit" className="order-track-submit">
              <Search className="w-5 h-5" />
              ট্র্যাক করুন
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">সমস্যা হলে আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন</p>
          </form>
        </div>

        {trackResult && (
          <div className="order-track-result">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
              <div>
                <p className="text-xs text-gray-400">অর্ডার আইডি</p>
                <h2 className="text-lg font-bold text-gray-900">{trackResult.id}</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">{trackResult.status}</span>
            </div>

            <div className="order-track-steps">
              <div className="order-track-step done"><span><CheckCircle2 /></span><div><strong>অর্ডার গৃহীত ও কনফার্মড</strong><small>আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে</small></div></div>
              <div className="order-track-step done"><span><PackageCheck /></span><div><strong>প্যাকিং সম্পন্ন</strong><small>বাগান থেকে ফ্রেশ পণ্য প্যাক করা হয়েছে</small></div></div>
              <div className="order-track-step active"><span><Truck /></span><div><strong>কুরিয়ারে পাঠানো হয়েছে</strong><small>আপনার অর্ডার এখন ডেলিভারির পথে</small></div></div>
              <div className="order-track-step"><span><MapPin /></span><div><strong>ডেলিভারি সম্পন্ন</strong><small>পণ্য হাতে পৌঁছালে এই ধাপ সম্পন্ন হবে</small></div></div>
            </div>

            <div className="mt-5 rounded-xl bg-[#fff7f9] px-4 py-3 text-sm text-gray-700">
              সম্ভাব্য ডেলিভারি সময়: <strong className="text-[#df2d4d]">{trackResult.eta}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
