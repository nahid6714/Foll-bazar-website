'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Tag,
  User,
  Smartphone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Check,
  CreditCard,
  Banknote,
  Copy,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CartItem } from '@/lib/data';
import { createOrderInSupabase } from '@/lib/order-service';

export interface OrderSubmittedData {
  orderId: string;
  items: {
    title: string;
    price: number;
    quantity: number;
    productId?: string;
    variant?: string;
  }[];
  name: string;
  phone: string;
  email?: string;
  address: string;
  division?: string;
  district?: string;
  upazila?: string;
  note?: string;
  paymentMethod: string;
  paymentTitle: string;
  trxId?: string;
  senderPhone?: string;
  deliveryArea: string;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
  couponCode?: string;
}

interface CartOrderViewProps {
  cartItems: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onChangeVariant: (id: string, variant: string) => void;
  onNavigateToShop: () => void;
  onOrderSuccess: (orderData: OrderSubmittedData) => void;
  currentUser?: { name: string; phone: string; email?: string } | null;
}

function generateOrderId(): string {
  return 'FB-' + Math.floor(10000 + Math.random() * 90000);
}

// Payment method options
const PAYMENT_OPTIONS = [
  {
    id: 'cash',
    title: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
    description: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন (সবচেয়ে সহজ ও নিরাপদ)',
    badge: 'জনপ্রিয়',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    type: 'cod',
  },
  {
    id: 'bkash',
    title: 'বিকাশ (bKash)',
    description: 'বিকাশ সেন্ড মানি অথবা পেমেন্ট করুন',
    badge: 'bKash',
    badgeColor: 'bg-pink-100 text-[#d8226b] font-bold',
    accountNumber: '01810-502120',
    accountType: 'Personal (সেন্ড মানি)',
    type: 'mfs',
    color: '#d8226b',
  },
  {
    id: 'nagad',
    title: 'নগদ (Nagad)',
    description: 'নগদ অ্যাপ বা ডায়াল করে সেন্ড মানি করুন',
    badge: 'Nagad',
    badgeColor: 'bg-orange-100 text-[#f26522] font-bold',
    accountNumber: '01810-502120',
    accountType: 'Personal (সেন্ড মানি)',
    type: 'mfs',
    color: '#f26522',
  },
  {
    id: 'rocket',
    title: 'রকেট (Rocket / DBBL)',
    description: 'রকেট অ্যাপ বা ১৬২১৬ ডায়াল করে সেন্ড মানি করুন',
    badge: 'Rocket',
    badgeColor: 'bg-purple-100 text-[#8c3494] font-bold',
    accountNumber: '01810-502120-7',
    accountType: 'Personal (সেন্ড মানি)',
    type: 'mfs',
    color: '#8c3494',
  },
  {
    id: 'shurjopay',
    title: 'ShurjoPay (সূর্যপে গেটওয়ে)',
    description: 'স্বয়ংক্রিয় ইনস্ট্যান্ট পেমেন্ট গেটওয়ে',
    badge: 'Gateway',
    badgeColor: 'bg-blue-100 text-blue-700',
    type: 'gateway',
  },
  {
    id: 'card',
    title: 'কার্ড / ইন্টারনেট ব্যাংকিং',
    description: 'ভিসা, মাস্টারকার্ড, অ্যামেক্স অথবা নেট ব্যাংকিং',
    badge: 'Cards',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    type: 'gateway',
  },
];

export default function CartOrderView({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onChangeVariant: _onChangeVariant,
  onNavigateToShop,
  onOrderSuccess,
  currentUser,
}: CartOrderViewProps) {
  // 1. স্ক্রিনশটের ফর্ম ফিল্ডসমূহ
  const [fullName, setFullName] = useState(() => currentUser?.name || '');
  const [phone, setPhone] = useState(() => currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'dhaka' | 'outside'>('dhaka');
  const [orderNote, setOrderNote] = useState('');
  const [isShippingDropdownOpen, setIsShippingDropdownOpen] = useState(false);

  // 2. পেমেন্ট মেথড
  const [selectedPayment, setSelectedPayment] = useState<string>('cash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Submission & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    if (shippingMethod === 'dhaka') return 60;
    return 120;
  }, [shippingMethod]);

  const shippingLabel = useMemo(() => {
    if (shippingMethod === 'dhaka') return 'ঢাকার ভিতরে হোম ডেলিভারি — ৳ ৬০';
    return 'ঢাকার বাইরে কুরিয়ার ডেলিভারি — ৳ ১২০';
  }, [shippingMethod]);

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Copy helper
  const handleCopyNumber = (num: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  // Coupon apply handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    // Keep the existing instant UI feedback, but the server RPC is authoritative
    // and re-validates the coupon before creating the order.
    if (code === 'LICHOO50' || code === 'LITCHI50' || code === 'FRUIT50') {
      const discount = 50;
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      setCouponFeedback({ msg: `কুপন "${code}" প্রয়োগ হয়েছে! ৫০ টাকা ছাড় পেয়েছেন।`, type: 'success' });
    } else if (code === 'SUMMER10' || code === 'DISCOUNT10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      setCouponFeedback({ msg: `কুপন "${code}" প্রয়োগ হয়েছে! ১০% ছাড় পেয়েছেন।`, type: 'success' });
    } else {
      setCouponFeedback({ msg: 'অকার্যকর কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।', type: 'error' });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    setCouponFeedback(null);
  };

  // Order submission
  const handleOrderSubmit = () => {
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('অর্ডার করার জন্য অনুগ্রহ করে আগে একটি পণ্য কার্টে যোগ করুন।');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।');
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    if (!division.trim() || !district.trim() || !upazila.trim()) {
      setErrorMessage('অনুগ্রহ করে বিভাগ, জেলা ও উপজেলা নির্বাচন/লিখুন।');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা দিন (বাসা নং, রোড, এলাকা)।');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    // Check MFS validation if selected
    if (['bkash', 'nagad', 'rocket'].includes(selectedPayment)) {
      if (!trxId.trim()) {
        setErrorMessage('আপনি বিকাশ/নগদ/রকেট নির্বাচন করেছেন। অনুগ্রহ করে টাকা পাঠিয়ে ট্রানজেকশন আইডি (TrxID) প্রদান করুন, অথবা ক্যাশ অন ডেলিভারি নির্বাচন করুন।');
        return;
      }
    }

    setIsSubmitting(true);

    const randomId = generateOrderId();
    const deliveryAreaTitle = shippingMethod === 'dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে';

    const selectedOpt = PAYMENT_OPTIONS.find((p) => p.id === selectedPayment);

    const orderData: OrderSubmittedData = {
      orderId: randomId,
      items: cartItems.map((item) => ({
        // Keep the canonical product UUID/legacy id so Supabase order_items
        // can be linked reliably even when the cart id contains a variant suffix.
        productId: item.productId || item.id.split('-')[0],
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
      name: fullName.trim(),
      phone: phone.trim(),
      email: currentUser?.email || undefined,
      address: address.trim(),
      division: division.trim(),
      district: district.trim(),
      upazila: upazila.trim(),
      note: orderNote.trim() || undefined,
      paymentMethod: selectedPayment,
      paymentTitle: selectedOpt?.title || 'ক্যাশ অন ডেলিভারি',
      trxId: trxId.trim() || undefined,
      senderPhone: senderPhone.trim() || undefined,
      deliveryArea: deliveryAreaTitle,
      deliveryFee,
      subtotal,
      discount: discountAmount,
      grandTotal,
      couponCode: appliedCoupon || undefined,
    };

    void createOrderInSupabase({
      orderNumber: randomId,
      name: orderData.name,
      phone: orderData.phone,
      email: orderData.email,
      address: orderData.address,
      division: orderData.division,
      district: orderData.district,
      upazila: orderData.upazila,
      deliveryNote: deliveryNote.trim() || undefined,
      note: orderData.note,
      shippingMethod,
      paymentMethod: orderData.paymentMethod,
      paymentTitle: orderData.paymentTitle,
      senderPhone: orderData.senderPhone,
      trxId: orderData.trxId,
      couponCode: orderData.couponCode,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      deliveryFee: orderData.deliveryFee,
      grandTotal: orderData.grandTotal,
      items: cartItems.map((item) => ({
        // Keep the canonical product UUID/legacy id separate from the cart id.
        productId: item.productId || item.id.split('::')[0] || item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
    }).then((saved) => {
      setIsSubmitting(false);
      // The database is authoritative. Show the values actually committed.
      onOrderSuccess({
        ...orderData,
        orderId: saved.order_number,
        subtotal: Number(saved.subtotal),
        discount: Number(saved.discount_amount),
        deliveryFee: Number(saved.delivery_charge),
        grandTotal: Number(saved.total_amount),
      });
    }).catch((error) => {
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : 'অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    });
  };

  const currentPaymentConfig = PAYMENT_OPTIONS.find((p) => p.id === selectedPayment);

  return (
    <div className="cart-order-page-wrapper bg-[#f8fafc] min-h-screen pb-56 sm:pb-36 pt-2 sm:pt-4 px-2 sm:px-4">
      <div className="checkout-main-container max-w-xl mx-auto">
        {/* Top Back navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#df2d4d] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>আরও পণ্য দেখুন</span>
          </button>
          <span className="text-xs text-gray-400 font-medium">সহজ ও দ্রুত অর্ডার</span>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2 shadow-2xs animate-fadeIn">
            <span className="font-bold text-base leading-none">⚠️</span>
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ORDER SUMMARY (Clean & compact view of cart items)                       */}
        {/* ========================================================================= */}
        {cartItems.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-3.5 sm:p-4 mb-4">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#df2d4d]" />
                <span className="font-bold text-sm sm:text-base text-gray-900">
                  আপনার নির্বাচিত পণ্য ({cartItems.length}টি)
                </span>
              </div>
              <button
                type="button"
                onClick={onNavigateToShop}
                className="text-xs text-[#df2d4d] font-semibold hover:underline"
              >
                + পণ্য যোগ করুন
              </button>
            </div>

            {/* Item list */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#df2d4d] font-bold">
                        ৳ {item.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold active:scale-95"
                        aria-label="কমান"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs sm:text-sm font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold active:scale-95"
                        aria-label="বাড়ান"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> কুপন &quot;{appliedCoupon}&quot; চালু আছে (-৳{discountAmount})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:underline font-bold text-xs"
                  >
                    মুছুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="কুপন কোড লিখুন (যেমন: LICHOO50)"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#df2d4d] bg-gray-50/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl shrink-0"
                  >
                    প্রয়োগ
                  </button>
                </form>
              )}
              {couponFeedback && (
                <p className={`text-xs mt-1.5 font-medium ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {couponFeedback.msg}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 text-xs sm:text-sm text-amber-800 flex items-center justify-between">
            <span>কার্টে কোনো পণ্য নেই। পণ্য পছন্দ করে অর্ডার করুন।</span>
            <button
              type="button"
              onClick={onNavigateToShop}
              className="text-[#df2d4d] font-bold underline shrink-0 ml-2"
            >
              পণ্য বাছুন
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN ORDER FORM CARD - EXACT FIELDS FROM SCREENSHOT                       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 mb-5">
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></span>
            <span>ডেলিভারি তথ্য দিন</span>
          </h3>

          {/* Field 1: পূর্ণ নাম * */}
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              পূর্ণ নাম <span className="text-[#df2d4d]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার সম্পূর্ণ নাম"
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#df2d4d] focus:ring-2 focus:ring-[#df2d4d]/15 transition"
              />
            </div>
          </div>

          {/* Field 2: মোবাইল নম্বর * */}
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              মোবাইল নম্বর <span className="text-[#df2d4d]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#df2d4d] focus:ring-2 focus:ring-[#df2d4d]/15 transition"
              />
            </div>
          </div>

          {/* Field 3: সম্পূর্ণ ঠিকানা * */}
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              সম্পূর্ণ ঠিকানা <span className="text-[#df2d4d]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা নং, রোড, এলাকা"
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#df2d4d] focus:ring-2 focus:ring-[#df2d4d]/15 transition"
              />
            </div>
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <label className="block text-sm font-bold text-gray-800">
              বিভাগ <span className="text-[#df2d4d]">*</span>
              <input value={division} onChange={(e) => setDivision(e.target.value)} placeholder="যেমন: ঢাকা" required className="mt-1 w-full px-3 py-3 bg-white border border-gray-300 rounded-xl text-sm font-normal focus:outline-none focus:border-[#df2d4d]" />
            </label>
            <label className="block text-sm font-bold text-gray-800">
              জেলা <span className="text-[#df2d4d]">*</span>
              <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="যেমন: ঢাকা" required className="mt-1 w-full px-3 py-3 bg-white border border-gray-300 rounded-xl text-sm font-normal focus:outline-none focus:border-[#df2d4d]" />
            </label>
            <label className="block text-sm font-bold text-gray-800">
              উপজেলা <span className="text-[#df2d4d]">*</span>
              <input value={upazila} onChange={(e) => setUpazila(e.target.value)} placeholder="যেমন: তেজগাঁও" required className="mt-1 w-full px-3 py-3 bg-white border border-gray-300 rounded-xl text-sm font-normal focus:outline-none focus:border-[#df2d4d]" />
            </label>
          </div>

          {/* Field 4: শিপিং */}
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              শিপিং
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShippingDropdownOpen(!isShippingDropdownOpen)}
                className="w-full py-3 sm:py-3.5 px-4 bg-[#f3f4f6]/80 hover:bg-[#f3f4f6] border border-gray-200 rounded-xl text-left flex items-center justify-between text-sm sm:text-base text-gray-700 font-medium transition cursor-pointer"
              >
                <span>{shippingLabel}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isShippingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Shipping options dropdown */}
              {isShippingDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShippingMethod('dhaka');
                      setIsShippingDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-gray-50 ${shippingMethod === 'dhaka' ? 'bg-red-50/70 text-[#df2d4d] font-bold' : 'text-gray-700'}`}
                  >
                    <span>ঢাকার ভিতরে হোম ডেলিভারি</span>
                    <span className="font-bold">৳ ৬০</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShippingMethod('outside');
                      setIsShippingDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-gray-50 ${shippingMethod === 'outside' ? 'bg-red-50/70 text-[#df2d4d] font-bold' : 'text-gray-700'}`}
                  >
                    <span>ঢাকার বাইরে কুরিয়ার ডেলিভারি</span>
                    <span className="font-bold">৳ ১২০</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Field 5: অর্ডার নোট (ঐচ্ছিক) */}
          <div className="mb-2">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              অর্ডার নোট <span className="text-gray-400 font-normal text-xs sm:text-sm">(ঐচ্ছিক)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </span>
              <textarea
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="ডেলিভারি সম্পর্কে কিছু বলতে চাইলে লিখুন . . ."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#df2d4d] focus:ring-2 focus:ring-[#df2d4d]/15 transition resize-none"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5">
              ডেলিভারি নোট <span className="text-gray-400 font-normal text-xs sm:text-sm">(ঐচ্ছিক)</span>
            </label>
            <textarea
              rows={2}
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="ডেলিভারি ম্যানকে কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#df2d4d] focus:ring-2 focus:ring-[#df2d4d]/15 transition resize-none"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAYMENT METHOD SELECTION - RESTORED FULL PAYMENT OPTIONS                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#df2d4d]" />
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                পেমেন্ট পদ্ধতি নির্বাচন করুন <span className="text-[#df2d4d]">*</span>
              </h3>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              ১০০% নিরাপদ
            </span>
          </div>

          {/* Payment list radio cards */}
          <div className="space-y-2.5">
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = selectedPayment === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`block relative border rounded-xl p-3 sm:p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#df2d4d] bg-red-50/40 shadow-xs ring-1 ring-[#df2d4d]'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name="paymentOption"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setSelectedPayment(opt.id)}
                        className="w-4 h-4 text-[#df2d4d] accent-[#df2d4d] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-gray-900">
                            {opt.title}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    {opt.id === 'cash' ? (
                      <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : opt.id === 'shurjopay' || opt.id === 'card' ? (
                      <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Sub-card when bKash / Nagad / Rocket is chosen */}
          {currentPaymentConfig?.type === 'mfs' && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-gray-800 text-xs sm:text-sm animate-fadeIn">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/80">
                <span className="font-bold text-gray-900">
                  {currentPaymentConfig.title} পার্সোনাল নম্বর:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm sm:text-base text-gray-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                    {currentPaymentConfig.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(currentPaymentConfig.accountNumber || '')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 text-gray-800 border border-amber-300 rounded font-medium text-xs shadow-2xs active:scale-95 transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                    <span>{copiedNumber ? 'কপি হয়েছে!' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-amber-900 mb-3 leading-relaxed">
                👉 আমাদের নম্বরে মোট <strong>৳{grandTotal.toFixed(2)}</strong> সেন্ড মানি (Send Money) করে নিচের তথ্যগুলো দিন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    প্রেরক মোবাইল নম্বর <span className="text-[#df2d4d]">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#df2d4d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    TrxID (ট্রানজেকশন আইডি) <span className="text-[#df2d4d]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 9J76KL2M"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#df2d4d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub-card for online gateways */}
          {currentPaymentConfig?.type === 'gateway' && (
            <div className="mt-4 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs sm:text-sm text-blue-900 flex items-center gap-2 animate-fadeIn">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                &quot;অর্ডার করুন&quot; বাটনে চাপলে আপনাকে স্বয়ংক্রিয়ভাবে সিকিউর পেমেন্ট গেটওয়েতে নিয়ে যাওয়া হবে।
              </span>
            </div>
          )}

          {/* In-page direct order button */}
          <div className="mt-5 pt-3 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOrderSubmit()}
              className="w-full py-3.5 px-4 bg-[#df2d4d] hover:bg-[#c82340] active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
              <span>অর্ডার কনফার্ম করুন (৳ {grandTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM STICKY ACTION BAR - Sits safely above the mobile bottom nav        */}
      {/* ========================================================================= */}
      <div className="fixed bottom-[60px] sm:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block leading-tight font-medium">
              সর্বমোট
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#df2d4d] leading-tight">
              ৳ {grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleOrderSubmit()}
            className="flex items-center justify-center gap-2 py-3 px-6 sm:px-8 bg-[#df2d4d] hover:bg-[#c82340] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
