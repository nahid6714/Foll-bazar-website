'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Tag,
  User,
  Phone,
  MapPin,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Truck,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { CartItem } from '@/lib/data';

// ==========================================
// BANGLADESH GEO DATA (Divisions, Districts, Upazilas)
// ==========================================
interface DistrictData {
  name: string;
  upazilas: string[];
}

interface DivisionData {
  name: string;
  districts: DistrictData[];
}

const BD_GEO_DATA: Record<string, DivisionData> = {
  dhaka: {
    name: 'ঢাকা (Dhaka)',
    districts: [
      {
        name: 'ঢাকা',
        upazilas: ['ধানমন্ডি', 'মিরপুর', 'গুলশান', 'বনানী', 'উত্তরা', 'মোহাম্মদপুর', 'মতিঝিল', 'যাত্রাবাড়ী', 'বাড্ডা', 'খিলগাঁও', 'সাভার', 'ধামরাই', 'কেরানীগঞ্জ'],
      },
      {
        name: 'গাজীপুর',
        upazilas: ['গাজীপুর সদর', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া', 'কালীগঞ্জ'],
      },
      {
        name: 'নারায়ণগঞ্জ',
        upazilas: ['নারায়ণগঞ্জ সদর', 'সোনারগাঁও', 'রূপগঞ্জ', 'আড়াইহাজার', 'বন্দর'],
      },
      {
        name: 'নরসিংদী',
        upazilas: ['নরসিংদী সদর', 'পলাশ', 'রায়পুরা', 'শিবপুর', 'বেলাবো', 'মনোহরদী'],
      },
      {
        name: 'টাঙ্গাইল',
        upazilas: ['টাঙ্গাইল সদর', 'মির্জাপুর', 'ঘাটাইল', 'মধুপুর', 'কালিহাতী', 'সখিপুর'],
      },
      {
        name: 'মানিকগঞ্জ',
        upazilas: ['মানিকগঞ্জ সদর', 'সিংগাইর', 'সাটুরিয়া', 'ঘিওর', 'শিবালয়'],
      },
      {
        name: 'মুন্সীগঞ্জ',
        upazilas: ['মুন্সীগঞ্জ সদর', 'টঙ্গীবাড়ী', 'সিরাজদিখান', 'লৌহজং', 'শ্রীনগর', 'গজারিয়া'],
      },
      {
        name: 'ফরিদপুর',
        upazilas: ['ফরিদপুর সদর', 'বোয়ালমারী', 'মধুখালী', 'ভাঙ্গা', 'চরভদ্রাসন', 'সদরপুর'],
      },
      {
        name: 'কিশোরগঞ্জ',
        upazilas: ['কিশোরগঞ্জ সদর', 'ভৈরব', 'করিমগঞ্জ', 'বাজিতপুর', 'হোসেনপুর', 'কটিয়াদী'],
      },
    ],
  },
  chattogram: {
    name: 'চট্টগ্রাম (Chattogram)',
    districts: [
      {
        name: 'চট্টগ্রাম',
        upazilas: ['পাহাড়তলী', 'পাঁচলাইশ', 'কোতোয়ালী', 'হালিশহর', 'সীতাকুণ্ড', 'মীরসরাই', 'ফটিকছড়ি', 'হাটহাজারী', 'পটিয়া', 'আনোয়ারা'],
      },
      {
        name: 'কক্সবাজার',
        upazilas: ['কক্সবাজার সদর', 'চকোরিয়া', 'মহেশখালী', 'টেকনাফ', 'রামু', 'উখিয়া', 'পেকুয়া'],
      },
      {
        name: 'কুমিল্লা',
        upazilas: ['কুমিল্লা আদর্শ সদর', 'চৌদ্দগ্রাম', 'লাকসাম', 'দাউদকান্দি', 'দেবীদ্বার', 'বরুড়া', 'মুরাদনগর'],
      },
      {
        name: 'ফেনী',
        upazilas: ['ফেনী সদর', 'দাগনভূঁঞা', 'ছাগলনাইয়া', 'সোনাগাজী', 'পরশুরাম', 'ফুলগাজী'],
      },
      {
        name: 'ব্রাহ্মণবাড়িয়া',
        upazilas: ['ব্রাহ্মণবাড়িয়া সদর', 'আশুগঞ্জ', 'নবীনগর', 'কসবা', 'সরাইল', 'নাসিরনগর'],
      },
      {
        name: 'নোয়াখালী',
        upazilas: ['নোয়াখালী সদর (সুধারাম)', 'বেগমগঞ্জ', 'চাটখিল', 'কোম্পানীগঞ্জ', 'হাতিয়া', 'সেনবাগ'],
      },
    ],
  },
  rajshahi: {
    name: 'রাজশাহী (Rajshahi)',
    districts: [
      {
        name: 'রাজশাহী',
        upazilas: ['বোয়ালিয়া', 'মতিহার', 'রাজপাড়া', 'পবা', 'বাঘা', 'চারঘাট', 'গোদাগাড়ী', 'তানোর', 'পুঠিয়া'],
      },
      {
        name: 'বগুড়া',
        upazilas: ['বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'কাহালু', 'দুপচাঁচিয়া', 'গাবতলী', 'সোনাতলা'],
      },
      {
        name: 'পাবনা',
        upazilas: ['পাবনা সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'সুজানগর', 'চাটমোহর', 'বেড়া'],
      },
      {
        name: 'সিরাজগঞ্জ',
        upazilas: ['সিরাজগঞ্জ সদর', 'শাহজাদপুর', 'উল্লাপাড়া', 'বেলকুচি', 'কামারখন্দ', 'রায়গঞ্জ'],
      },
      {
        name: 'নওগাঁ',
        upazilas: ['নওগাঁ সদর', 'মহাদেবপুর', 'বদলগাছী', 'পত্নীতলা', 'ধামইরহাট', 'মান্দা'],
      },
      {
        name: 'নাটোর',
        upazilas: ['নাটোর সদর', 'সিংড়া', 'গুরুদাসপুর', 'বড়াইগ্রাম', 'লালপুর', 'বাগাতিপাড়া'],
      },
      {
        name: 'চাঁপাইনবাবগঞ্জ',
        upazilas: ['চাঁপাইনবাবগঞ্জ সদর', 'শিবগঞ্জ', 'গোমস্তাপুর', 'নাচোল', 'ভোলাহাট'],
      },
    ],
  },
  rangpur: {
    name: 'রংপুর (Rangpur)',
    districts: [
      {
        name: 'দিনাজপুর',
        upazilas: ['দিনাজপুর সদর', 'কাহারোল', 'বীরগঞ্জ', 'চিরিরবন্দর', 'ফুলবাড়ী', 'নবাবগঞ্জ', 'বিরামপুর', 'হাকিমপুর', 'ঘোড়াঘাট', 'পার্বতীপুর'],
      },
      {
        name: 'রংপুর',
        upazilas: ['রংপুর সদর', 'মিঠাপুকুর', 'পীরগঞ্জ', 'বদরগঞ্জ', 'গঙ্গাচড়া', 'কাউনিয়া', 'তারাগঞ্জ'],
      },
      {
        name: 'কুড়িগ্রাম',
        upazilas: ['কুড়িগ্রাম সদর', 'উলিপুর', 'নাগেশ্বরী', 'ভূরুঙ্গামারী', 'রাজারহাট', 'চিলমারী'],
      },
      {
        name: 'গাইবান্ধা',
        upazilas: ['গাইবান্ধা সদর', 'গোবিন্দগঞ্জ', 'পলাশবাড়ী', 'সুন্দরগঞ্জ', 'সাদুল্লাপুর'],
      },
      {
        name: 'ঠাকুরগাঁও',
        upazilas: ['ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'বালিয়াডাঙ্গী', 'রাণীশংকৈল', 'হরিপুর'],
      },
      {
        name: 'পঞ্চগড়',
        upazilas: ['পঞ্চগড় সদর', 'বোদা', 'তেঁতুলিয়া', 'দেবীগঞ্জ', 'আটোয়ারী'],
      },
      {
        name: 'নীলফামারী',
        upazilas: ['নীলফামারী সদর', 'সৈয়দপুর', 'ডোমার', 'জলঢাকা', 'কিশোরগঞ্জ', 'ডিমলা'],
      },
      {
        name: 'লালমনিরহাট',
        upazilas: ['লালমনিরহাট সদর', 'হাতীবান্ধা', 'পাটগ্রাম', 'কালীগঞ্জ', 'আদিতমারী'],
      },
    ],
  },
  khulna: {
    name: 'খুলনা (Khulna)',
    districts: [
      {
        name: 'খুলনা',
        upazilas: ['খুলনা সদর', 'দৌলতপুর', 'খালিশপুর', 'ডুমুরিয়া', 'বটিয়াঘাটা', 'রূপসা', 'পাইকগাছা'],
      },
      {
        name: 'যশোর',
        upazilas: ['যশোর সদর', 'ঝিকরগাছা', 'শার্শা', 'মণিরামপুর', 'কেশবপুর', 'চৌগাছা'],
      },
      {
        name: 'কুষ্টিয়া',
        upazilas: ['কুষ্টিয়া সদর', 'কুমারখালী', 'ভেড়ামারা', 'মিরপুর', 'খোকসা', 'দৌলতপুর'],
      },
      {
        name: 'সাতক্ষীরা',
        upazilas: ['সাতক্ষীরা সদর', 'কলারোয়া', 'তালা', 'কালীগঞ্জ', 'শ্যামনগর', 'আশাশুনি'],
      },
    ],
  },
  barishal: {
    name: 'বরিশাল (Barishal)',
    districts: [
      {
        name: 'বরিশাল',
        upazilas: ['বরিশাল সদর', 'বাবুগঞ্জ', 'উজিরপুর', 'বাকেরগঞ্জ', 'গৌরনদী', 'মেহেন্দিগঞ্জ'],
      },
      {
        name: 'পটুয়াখালী',
        upazilas: ['পটুয়াখালী সদর', 'গলাচিপা', 'বাউফল', 'কলাপাড়া', 'দুমকি', 'মির্জাগঞ্জ'],
      },
      {
        name: 'ভোলা',
        upazilas: ['ভোলা সদর', 'বোরহানউদ্দিন', 'দৌলতখান', 'লালমোহন', 'চরফ্যাশন', 'তজুমদ্দিন'],
      },
    ],
  },
  sylhet: {
    name: 'সিলেট (Sylhet)',
    districts: [
      {
        name: 'সিলেট',
        upazilas: ['সিলেট সদর', 'দক্ষিণ সুরমা', 'গোলাপগঞ্জ', 'বিয়ানীবাজার', 'জৈন্তাপুর', 'বিশ্বনাথ'],
      },
      {
        name: 'মৌলভীবাজার',
        upazilas: ['মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা'],
      },
      {
        name: 'হবিগঞ্জ',
        upazilas: ['হবিগঞ্জ সদর', 'মাধবপুর', 'চুনারুঘাট', 'নবীগঞ্জ', 'বাহুবল'],
      },
      {
        name: 'সুনামগঞ্জ',
        upazilas: ['সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'তাহিরপুর', 'দিরাই'],
      },
    ],
  },
  mymensingh: {
    name: 'ময়মনসিংহ (Mymensingh)',
    districts: [
      {
        name: 'ময়মনসিংহ',
        upazilas: ['ময়মনসিংহ সদর', 'মুক্তাগাছা', 'ত্রিশাল', 'ভালুকা', 'গফরগাঁও', 'ফুলবাড়ীয়া', 'ঈশ্বরগঞ্জ'],
      },
      {
        name: 'জামালপুর',
        upazilas: ['জামালপুর সদর', 'সরিষাবাড়ী', 'মেলান্দহ', 'ইসলামপুর', 'দেওয়ানগঞ্জ'],
      },
      {
        name: 'নেত্রকোণা',
        upazilas: ['নেত্রকোণা সদর', 'কেন্দুয়া', 'পূর্বধলা', 'মোহনগঞ্জ', 'দুর্গাপুর'],
      },
      {
        name: 'শেরপুর',
        upazilas: ['শেরপুর সদর', 'নকলা', 'নালিতাবাড়ী', 'শ্রীবরদী', 'ঝিনাইগাতী'],
      },
    ],
  },
};

export interface OrderSubmittedData {
  orderId: string;
  items: { title: string; price: number; quantity: number }[];
  name: string;
  phone: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  note?: string;
  paymentMethod: string;
  paymentTitle: string;
  trxId?: string;
  deliveryArea: string;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
}

interface CartOrderViewProps {
  cartItems: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigateToShop: () => void;
  onOrderSuccess: (orderData: OrderSubmittedData) => void;
  currentUser?: { name: string; phone: string; email?: string } | null;
}

function generateOrderId(): string {
  return 'FB-' + Math.floor(10000 + Math.random() * 90000);
}

export default function CartOrderView({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onNavigateToShop,
  onOrderSuccess,
  currentUser,
}: CartOrderViewProps) {
  // Form states matching Screenshots 1, 2, 3, 4
  const [fullName, setFullName] = useState(() => currentUser?.name || '');
  const [phone, setPhone] = useState(() => currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [divisionKey, setDivisionKey] = useState<string>('dhaka');
  const [district, setDistrict] = useState<string>('ঢাকা');
  const [upazila, setUpazila] = useState<string>('');
  const [orderNote, setOrderNote] = useState('');

  // Payment method selection
  const [selectedPayment, setSelectedPayment] = useState<string>('cash');
  const [manualPhone, setManualPhone] = useState('');
  const [manualTrxId, setManualTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form error & loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived lists for cascading dropdowns
  const currentDivisionObj = divisionKey ? BD_GEO_DATA[divisionKey] : null;
  const availableDistricts = useMemo(() => {
    return currentDivisionObj ? currentDivisionObj.districts : [];
  }, [currentDivisionObj]);

  const currentDistrictObj = useMemo(() => {
    return availableDistricts.find((d) => d.name === district);
  }, [availableDistricts, district]);

  const availableUpazilas = useMemo(() => {
    return currentDistrictObj ? currentDistrictObj.upazilas : [];
  }, [currentDistrictObj]);

  // Only show products that are actually in the user's cart.
  // An empty cart must never inject a demo/default product into checkout.
  const displayItems: CartItem[] = cartItems;

  // Financial calculations
  const totalItemCount = displayItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // In Screenshot 4, delivery charge is shown as ৳ 0.00
  // We can make it free if subtotal is very small or standard ৳ 0.00 for demo promo, or toggle based on location
  const deliveryFee = divisionKey === 'dhaka' ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Handle coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponFeedback({ msg: 'অনুগ্রহ করে কুপন কোড লিখুন', type: 'error' });
      return;
    }

    if (code === 'FALBAZAR' || code === 'SAVE10' || code === 'EID2026' || code === 'OFFER') {
      const discount = Math.round(subtotal * 0.1) || 1; // 10% discount
      setAppliedCoupon(code);
      setDiscountAmount(discount);
      setCouponFeedback({ msg: `🎉 "${code}" কুপন সফলভাবে প্রয়োগ হয়েছে! ৳ ${discount} ছাড়।`, type: 'success' });
    } else {
      setCouponFeedback({ msg: 'দুঃখিত, কুপন কোডটি সঠিক নয় বা মেয়াদ উত্তীর্ণ।', type: 'error' });
    }
  };

  // Handle copying manual payment phone number
  const handleCopyNumber = (num: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  // Handle Order Submit
  const handleOrderSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      window.scrollTo({ top: 450, behavior: 'smooth' });
      return;
    }
    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা দিন (বাসা নং, রোড, এলাকা)।');
      window.scrollTo({ top: 500, behavior: 'smooth' });
      return;
    }
    if (!divisionKey) {
      setErrorMessage('অনুগ্রহ করে বিভাগ বেছে নিন।');
      return;
    }
    if (!district) {
      setErrorMessage('অনুগ্রহ করে জেলা নির্বাচন করুন।');
      return;
    }

    // Manual payment validation
    if (
      (selectedPayment === 'bkash_manual' ||
        selectedPayment === 'nagad_manual' ||
        selectedPayment === 'rocket_manual') &&
      !manualTrxId.trim()
    ) {
      setErrorMessage('অনুগ্রহ করে আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const randomId = generateOrderId();

    const paymentTitles: Record<string, string> = {
      cash: 'ক্যাশ অন ডেলিভারি',
      bkash_gateway: 'bKash পেমেন্ট',
      shurjopay: 'ShurjoPay',
      uddoktapay: 'UddoktaPay',
      aamarpay: 'aamarPay',
      bkash_manual: 'Manual Bkash',
      nagad_manual: 'Nagad Manual',
      rocket_manual: 'Rocket Personal',
    };

    const orderData: OrderSubmittedData = {
      orderId: randomId,
      items: displayItems.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      division: currentDivisionObj?.name || divisionKey,
      district: district,
      upazila: upazila || 'সদর',
      note: orderNote.trim() || undefined,
      paymentMethod: selectedPayment,
      paymentTitle: paymentTitles[selectedPayment] || 'ক্যাশ অন ডেলিভারি',
      trxId: manualTrxId.trim() || undefined,
      deliveryArea: divisionKey === 'dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
      deliveryFee,
      subtotal,
      discount: discountAmount,
      grandTotal,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(orderData);
    }, 800);
  };

  if (displayItems.length === 0) {
    return (
      <div className="cart-order-page-wrapper bg-[#f8fafc] min-h-screen pb-28 pt-3 sm:pt-6">
        <div className="checkout-main-container max-w-2xl mx-auto px-3 sm:px-4">
          <div className="checkout-card bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 sm:p-10 text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#fff1f4] flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[#df2d4d]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">আপনার কার্ট খালি</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-6">অর্ডার করার জন্য আগে আপনার পছন্দের পণ্য কার্টে যোগ করুন।</p>
            <button
              type="button"
              onClick={onNavigateToShop}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#df2d4d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c82340] transition"
            >
              <ShoppingBag className="w-4 h-4" />
              পণ্য দেখুন ও কার্টে যোগ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-order-page-wrapper bg-[#f8fafc] min-h-screen pb-28 pt-3 sm:pt-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        {/* Top Back / Navigation link */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#df2d4d] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>আরও ফল কিনুন</span>
          </button>
          <span className="text-xs text-gray-400 font-medium">নিরাপদ ও দ্রুত চেকআউট</span>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="checkout-error-banner mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2 shadow-xs">
            <span className="font-bold text-base leading-none">⚠️</span>
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. ORDER SUMMARY CARD - EXACT MATCH SCREENSHOT 4                         */}
        {/* ========================================================================= */}
        <div className="checkout-card checkout-summary-card bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 mb-4">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#df2d4d]" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">অর্ডার সামারি</h2>
            </div>
            <span className="bg-[#df2d4d] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {totalItemCount} টি পণ্য
            </span>
          </div>

          {/* Product Items List */}
          <div className="divide-y divide-gray-100">
            {displayItems.map((item, index) => (
              <div key={item.id} className="py-3 flex items-start gap-3 relative">
                {/* Thumbnail with red corner badge */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="72px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badge 1 (matching red circle in screenshot 4) */}
                  <span className="absolute top-1 left-1 bg-[#df2d4d] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      ৳ {item.price}
                    </span>
                    {item.oldPrice && item.oldPrice > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳ {item.oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove button (Top right ✕) */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute top-3 right-0 text-gray-400 hover:text-red-500 p-1 transition"
                  aria-label="পণ্য মুছুন"
                >
                  <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                {/* Quantity Pill Stepper (Bottom right [- 1 +] matching screenshot 4) */}
                <div className="absolute bottom-3 right-0 inline-flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold active:bg-gray-200 transition text-sm"
                    aria-label="কমান"
                  >
                    -
                  </button>
                  <span className="px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-gray-900 select-none">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold active:bg-gray-200 transition text-sm"
                    aria-label="বাড়ান"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Input Bar (Screenshot 4) */}
          <form onSubmit={handleApplyCoupon} className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:border-[#df2d4d] focus-within:ring-2 focus-within:ring-[#df2d4d]/15 transition bg-white">
              <div className="pl-3.5 flex items-center text-gray-400">
                <Tag className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="কুপন কোড লিখুন..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-[#df2d4d] hover:bg-[#c82340] text-white font-bold text-xs sm:text-sm px-5 transition shrink-0"
              >
                প্রয়োগ
              </button>
            </div>

            {couponFeedback && (
              <p
                className={`mt-2 text-xs font-medium ${
                  couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {couponFeedback.msg}
              </p>
            )}
          </form>

          {/* Pricing Breakdown (Screenshot 4) */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>সাবটোটাল</span>
              <span className="font-semibold text-gray-900">৳ {subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>কুপন ছাড় ({appliedCoupon})</span>
                <span>- ৳ {discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-gray-600">
              <span>ডেলিভারি চার্জ</span>
              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? '৳ 0.00' : `৳ ${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="border-b border-dashed border-gray-200 pt-1"></div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-base sm:text-lg font-bold text-gray-900">সর্বমোট</span>
              <span className="text-base sm:text-lg font-extrabold text-[#df2d4d]">
                ৳ {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DELIVERY INFORMATION CARD - EXACT MATCH SCREENSHOT 3 & 4               */}
        {/* ========================================================================= */}
        <div className="checkout-card checkout-delivery-card bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 mb-4">
          {/* Step 1 Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="checkout-step-badge">
              1
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                ডেলিভারি তথ্য
              </h2>
              <p className="text-xs text-gray-500">আপনার নাম, ফোন ও ঠিকানা দিন</p>
            </div>
          </div>

          <div>
            {/* Field 1: পূর্ণ নাম * */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                পূর্ণ নাম <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-input-wrap">
                <span className="checkout-input-icon">
                  <User className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ নাম"
                  className="checkout-input"
                />
              </div>
            </div>

            {/* Field 2: মোবাইল নম্বর * */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                মোবাইল নম্বর <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-input-wrap">
                <span className="checkout-input-icon">
                  <Phone className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="checkout-input"
                />
              </div>
            </div>

            {/* Field 3: সম্পূর্ণ ঠিকানা * */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                সম্পূর্ণ ঠিকানা <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-input-wrap">
                <span className="checkout-input-icon">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা নং, রোড, এলাকা"
                  className="checkout-input"
                />
              </div>
            </div>

            {/* Field 4: বিভাগ * (Screenshot 3) */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                বিভাগ <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-select-wrap">
                <select
                  value={divisionKey}
                  onChange={(e) => {
                    const newDiv = e.target.value;
                    setDivisionKey(newDiv);
                    // Reset district & upazila
                    if (newDiv && BD_GEO_DATA[newDiv]) {
                      const firstDist = BD_GEO_DATA[newDiv].districts[0]?.name || '';
                      setDistrict(firstDist);
                      setUpazila('');
                    } else {
                      setDistrict('');
                      setUpazila('');
                    }
                  }}
                  className="checkout-select"
                >
                  <option value="">বিভাগ বেছে নিন</option>
                  {Object.entries(BD_GEO_DATA).map(([key, data]) => (
                    <option key={key} value={key}>
                      {data.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 checkout-select-arrow" />
              </div>
            </div>

            {/* Field 5: জেলা * (Screenshot 3) */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                জেলা <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-select-wrap">
                <select
                  disabled={!divisionKey}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setUpazila('');
                  }}
                  className="checkout-select"
                >
                  {!divisionKey ? (
                    <option value="">আগে বিভাগ নিন</option>
                  ) : (
                    availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-4 h-4 checkout-select-arrow" />
              </div>
            </div>

            {/* Field 6: উপজেলা * (Screenshot 2 & 3) */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                উপজেলা <span className="text-[#df2d4d]">*</span>
              </label>
              <div className="checkout-select-wrap">
                <select
                  disabled={!district}
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="checkout-select"
                >
                  {!district ? (
                    <option value="">আগে জেলা নিন</option>
                  ) : (
                    <>
                      <option value="">উপজেলা নির্বাচন করুন</option>
                      {availableUpazilas.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                      <option value="সদর">সদর / অন্যান্য</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 checkout-select-arrow" />
              </div>
            </div>

            {/* Field 7: অর্ডার নোট (ঐচ্ছিক) (Screenshot 2) */}
            <div className="checkout-form-group">
              <label className="checkout-label">
                অর্ডার নোট <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="checkout-input-wrap">
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="ডেলিভারি সম্পর্কে কিছু বলতে চাইলে লিখুন . . ."
                  className="checkout-textarea"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. PAYMENT METHOD CARD - EXACT MATCH SCREENSHOTS 1 & 2                    */}
        {/* ========================================================================= */}
        <div className="checkout-card checkout-payment-card bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 mb-6">
          {/* Step 2 Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="checkout-step-badge">
              2
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                পেমেন্ট পদ্ধতি
              </h2>
              <p className="text-xs text-gray-500">আপনার পছন্দের পেমেন্ট বেছে নিন</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* 1. ক্যাশ অন ডেলিভারি (Screenshot 2) */}
            <div
              onClick={() => setSelectedPayment('cash')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedPayment === 'cash'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    ক্যাশ অন ডেলিভারি
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className="shrink-0 pl-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPayment === 'cash'
                      ? 'border-[#df2d4d]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedPayment === 'cash' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. bKash পেমেন্ট (Screenshot 2) */}
            <div
              onClick={() => setSelectedPayment('bkash_gateway')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedPayment === 'bkash_gateway'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#e2136e]/10 flex items-center justify-center shrink-0 border border-[#e2136e]/20">
                  {/* bKash Icon SVG */}
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M6 16L18 4L16 16L26 8L18 28L14 18L6 16Z"
                      fill="#e2136e"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    bKash পেমেন্ট
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    বিকাশ অ্যাপ বা গেটওয়ে দ্বারা পেমেন্ট
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPayment === 'bkash_gateway'
                      ? 'border-[#df2d4d]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedPayment === 'bkash_gateway' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. ShurjoPay (Screenshot 1 & 2) */}
            <div
              onClick={() => setSelectedPayment('shurjopay')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedPayment === 'shurjopay'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <span className="text-[10px] font-black tracking-tighter text-[#00a859]">
                    shurjo<span className="text-[#0072bc]">Pay</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    ShurjoPay
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    Card / Mobile Banking
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPayment === 'shurjopay'
                      ? 'border-[#df2d4d]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedPayment === 'shurjopay' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. UddoktaPay (Screenshot 1) */}
            <div
              onClick={() => setSelectedPayment('uddoktapay')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedPayment === 'uddoktapay'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
                  <span className="text-[9px] font-bold text-[#0084ff]">UddoktaPay</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    UddoktaPay
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    মোবাইল ব্যাংকিং পেমেন্ট গেটওয়ে
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPayment === 'uddoktapay'
                      ? 'border-[#df2d4d]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedPayment === 'uddoktapay' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. aamarPay (Screenshot 1) */}
            <div
              onClick={() => setSelectedPayment('aamarpay')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedPayment === 'aamarpay'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <span className="text-[10px] font-bold text-[#f15a24]">aamarPay</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    aamarPay
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    কার্ড ও মোবাইল ব্যাংকিং
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPayment === 'aamarpay'
                      ? 'border-[#df2d4d]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedPayment === 'aamarpay' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Manual Bkash (Screenshot 1) */}
            <div
              onClick={() => setSelectedPayment('bkash_manual')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                selectedPayment === 'bkash_manual'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e2136e]/10 flex items-center justify-center shrink-0 border border-[#e2136e]/20">
                    <span className="text-xs font-bold text-[#e2136e]">বিকাশ</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      Manual Bkash
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPayment === 'bkash_manual'
                        ? 'border-[#df2d4d]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedPayment === 'bkash_manual' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable info when selected */}
              {selectedPayment === 'bkash_manual' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700 animate-fadeIn">
                  <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 block">বিকাশ পার্সোনাল নম্বর (Send Money):</span>
                      <span className="font-bold text-sm text-[#e2136e]">01711-223344</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyNumber('01711223344');
                      }}
                      className="px-2.5 py-1 bg-white border border-pink-200 text-[#e2136e] rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-pink-50"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="আপনার বিকাশ নম্বর"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                    <input
                      type="text"
                      value={manualTrxId}
                      onChange={(e) => setManualTrxId(e.target.value)}
                      placeholder="ট্রানজেকশন আইডি (TrxID) যেমন: 8J19K2LL9"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Nagad Manual (Screenshot 1) */}
            <div
              onClick={() => setSelectedPayment('nagad_manual')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                selectedPayment === 'nagad_manual'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                    <span className="text-xs font-bold text-[#f7931e]">নগদ</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      Nagad Manual
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPayment === 'nagad_manual'
                        ? 'border-[#df2d4d]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedPayment === 'nagad_manual' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPayment === 'nagad_manual' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700 animate-fadeIn">
                  <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 block">নগদ পার্সোনাল নম্বর (Send Money):</span>
                      <span className="font-bold text-sm text-[#f7931e]">01822-334455</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyNumber('01822334455');
                      }}
                      className="px-2.5 py-1 bg-white border border-orange-200 text-[#f7931e] rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-orange-50"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="আপনার নগদ নম্বর"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                    <input
                      type="text"
                      value={manualTrxId}
                      onChange={(e) => setManualTrxId(e.target.value)}
                      placeholder="ট্রানজেকশন আইডি (TrxID) যেমন: 7HG82LL1P"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 8. Rocket Personal (Screenshot 1) */}
            <div
              onClick={() => setSelectedPayment('rocket_manual')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                selectedPayment === 'rocket_manual'
                  ? 'border-[#df2d4d] ring-1 ring-[#df2d4d] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                    <span className="text-[10px] font-bold text-[#8c3494]">রকেট</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      Rocket Personal
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPayment === 'rocket_manual'
                        ? 'border-[#df2d4d]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedPayment === 'rocket_manual' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#df2d4d]"></div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPayment === 'rocket_manual' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700 animate-fadeIn">
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 block">রকেট নম্বর (১২ ডিজিট):</span>
                      <span className="font-bold text-sm text-[#8c3494]">01911-223344-8</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyNumber('019112233448');
                      }}
                      className="px-2.5 py-1 bg-white border border-purple-200 text-[#8c3494] rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-purple-50"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="আপনার রকেট নম্বর"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                    <input
                      type="text"
                      value={manualTrxId}
                      onChange={(e) => setManualTrxId(e.target.value)}
                      placeholder="রকেট ট্রানজেকশন আইডি (TrxID)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STICKY BOTTOM ACTION BAR - EXACT MATCH SCREENSHOTS 1, 2, 3, 4          */}
      {/* ========================================================================= */}
      <div className="checkout-sticky-bar fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 sm:py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] sm:text-xs text-gray-500 block leading-tight font-medium">
              সর্বমোট
            </span>
            <span className="text-base sm:text-xl font-extrabold text-[#df2d4d] leading-tight">
              ৳ {grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleOrderSubmit()}
            className="checkout-sticky-btn flex items-center justify-center gap-2 py-3 px-6 sm:px-8 bg-[#df2d4d] hover:bg-[#c82340] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
