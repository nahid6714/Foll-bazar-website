'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/lib/data';

interface GccLiveChatProps {
  onOpenTrackModal: () => void;
  onOrderProduct: (product: Product) => void;
  allProducts: Product[];
  externalOpenComplaint?: boolean;
  onCloseComplaint?: () => void;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export default function GccLiveChat({
  onOpenTrackModal,
  onOrderProduct,
  allProducts,
  externalOpenComplaint,
  onCloseComplaint,
}: GccLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'স্বাগতম ফল বাজার-এ! 👋 আমি আপনার ভার্চুয়াল সহকারী। প্রোডাক্টের দাম, অর্ডার ট্র্যাকিং, ডেলিভারি বা কমপ্লেইন সংক্রান্ত যেকোনো প্রশ্নে আমি সাহায্য করতে প্রস্তুত।',
      time: 'এখন',
    },
  ]);

  // Complaint form states
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cOrder, setCOrder] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cSuccess, setCSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWidgetOpen = isOpen || Boolean(externalOpenComplaint);
  const isComplaintPanelOpen = showComplaint || Boolean(externalOpenComplaint);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: text.trim(),
      time: 'এখন',
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lower = text.toLowerCase();

      if (lower.includes('ট্র্যাক') || lower.includes('track') || lower.includes('অর্ডার কোথায়')) {
        botResponse = 'আপনার অর্ডার ট্র্যাক করতে উপরের "Track Order" বাটনে ক্লিক করে অর্ডার আইডি বা ফোন নম্বর দিন। অথবা আমাদের হটলাইন 01810502120 এ কল করতে পারেন।';
      } else if (lower.includes('রিফান্ড') || lower.includes('টাকা') || lower.includes('ফেরত')) {
        botResponse = 'ফল বাজার-এ ১০০% স্যাটিস্ফ্যাকশন গ্যারান্টি রয়েছে। ডেলিভারির সময় লিচুতে কোনো ক্ষতি থাকলে সাথে সাথে রিটার্ন করতে পারবেন অথবা আমাদের কমপ্লেইন বক্সে জানালে ২৪ ঘণ্টার মধ্যে রিফান্ড প্রসেস করা হয়।';
      } else if (lower.includes('ডেলিভারি') || lower.includes('চার্জ') || lower.includes('কবে পাব')) {
        botResponse = 'ঢাকার ভিতরে ডেলিভারি চার্জ মাত্র ৳৮০ (১-২ কার্যদিবস)। ঢাকার বাইরে ডেলিভারি চার্জ ৳১৫০ (২-৩ কার্যদিবস)। বাগান থেকে ফ্রেশ লিচু পাঠানো হয়।';
      } else if (lower.includes('প্রোডাক্ট') || lower.includes('লিচু') || lower.includes('দাম') || lower.includes('ভালো')) {
        botResponse = `আমাদের কাছে জনপ্রিয় দেশি লিচু ফ্রেশ প্যাক (৳১৩০০), গোলাপি লিচু স্পেশাল (৳১৩০০) এবং প্রিমিয়াম লাল লিচু (৳১২৫০) এভেইলেবল রয়েছে। আপনি যেকোনো পণ্যের 'অর্ডার করুন' বাটনে ক্লিক করে সহজেই অর্ডার করতে পারেন!`;
      } else if (lower.includes('কমপ্লেইন') || lower.includes('অভিযোগ') || lower.includes('সমস্যা')) {
        setShowComplaint(true);
        botResponse = 'আপনার অভিযোগটি নিচে পূরণ করে জমা দিন। আমাদের কাস্টমার সাপোর্ট টিম সর্বোচ্চ গুরুত্ব দিয়ে সমাধান করবে।';
      } else {
        botResponse = `ধন্যবাদ আপনার মেসেজের জন্য! আমাদের কাছে দিনাজপুরের সবচেয়ে ফ্রেশ ও রসালো লিচু পাওয়া যাচ্ছে। অর্ডার করতে সরাসরি ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারেন।`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: 'এখন',
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cPhone || !cDesc) {
      alert('অনুগ্রহ করে নাম, মোবাইল এবং বিস্তারিত পূরণ করুন।');
      return;
    }
    setCSuccess(true);
    setTimeout(() => {
      setShowComplaint(false);
      setCSuccess(false);
      setCName('');
      setCPhone('');
      setCOrder('');
      setCDesc('');
      if (onCloseComplaint) onCloseComplaint();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '✓ আপনার কমপ্লেইনটি সফলভাবে গৃহীত হয়েছে। আমাদের সাপোর্ট ম্যানেজার খুব শীঘ্রই আপনার নম্বরে যোগাযোগ করবেন।',
          time: 'এখন',
        },
      ]);
    }, 1200);
  };

  return (
    <div id="gcc-widget">
      {isWidgetOpen && (
        <div id="gcc-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div id="gcc-header">
            <div id="gcc-header-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gcc-header-icon-wrap" aria-hidden="true">
                  <svg
                    className="gcc-headset-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-5z" />
                    <path d="M21 11h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-5z" />
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  </svg>
                </div>
                <div>
                  <h5>লাইভ সহায়তা</h5>
                  <p className="gcc-header-sub">
                    <span className="gcc-online-dot"></span>অনলাইন সাহায্য চাইলে ক্লিক করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="gcc-close"
                aria-label="Close"
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseComplaint) onCloseComplaint();
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div id="gcc-chips">
            <button
              type="button"
              data-q="৫০০০ টাকার মধ্যে ভালো প্রোডাক্ট দেখান"
              onClick={() => handleSend('৫০০০ টাকার মধ্যে ভালো প্রোডাক্ট দেখান')}
            >
              🔍 প্রোডাক্ট খুঁজুন
            </button>
            <button
              type="button"
              data-q="আমার অর্ডার ট্র্যাক করতে চাই"
              onClick={() => {
                onOpenTrackModal();
                setIsOpen(false);
              }}
            >
              📦 অর্ডার ট্র্যাক
            </button>
            <button
              type="button"
              id="gcc-open-complaint"
              onClick={() => setShowComplaint(true)}
            >
              📝 কমপ্লেইন
            </button>
            <button
              type="button"
              data-q="রিফান্ড কিভাবে করব?"
              onClick={() => handleSend('রিফান্ড কিভাবে করব?')}
            >
              💰 রিফান্ড
            </button>
          </div>

          {/* Messages list */}
          <div id="gcc-messages" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: m.sender === 'user' ? '#df2d4d' : '#f3f4f6',
                  color: m.sender === 'user' ? '#fff' : '#1f2937',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div id="gcc-typing" style={{ display: 'block', alignSelf: 'flex-start' }}>
                ভাবছে...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div id="gcc-input-wrap">
            <form
              id="gcc-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', width: '100%' }}
            >
              <textarea
                id="gcc-input"
                rows={1}
                placeholder="মেসেজ লিখুন..."
                maxLength={2000}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button type="submit" id="gcc-send" aria-label="Send">
                ➤
              </button>
            </form>
          </div>

          {/* Complaint Panel */}
          {isComplaintPanelOpen && (
            <div id="gcc-complaint-panel" style={{ display: 'block' }}>
              <h6>কমপ্লেইন / সমস্যা জানান</h6>
              {cSuccess ? (
                <div style={{ color: '#16a34a', padding: '20px 0', textAlign: 'center' }}>
                  ✓ আপনার অভিযোগটি জমা হয়েছে!
                </div>
              ) : (
                <form onSubmit={handleComplaintSubmit}>
                  <label>নাম *</label>
                  <input
                    type="text"
                    id="gcc-c-name"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    maxLength={255}
                    required
                  />
                  <label>মোবাইল *</label>
                  <input
                    type="text"
                    id="gcc-c-phone"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    maxLength={20}
                    required
                  />
                  <label>অর্ডার/ইনভয়েস (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    id="gcc-c-order"
                    value={cOrder}
                    onChange={(e) => setCOrder(e.target.value)}
                    maxLength={50}
                  />
                  <label>বিস্তারিত *</label>
                  <textarea
                    id="gcc-c-desc"
                    rows={3}
                    maxLength={5000}
                    placeholder="সমস্যাটি লিখুন..."
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    required
                  />
                  <div id="gcc-complaint-actions">
                    <button
                      type="button"
                      className="gcc-complaint-cancel"
                      id="gcc-complaint-cancel"
                      onClick={() => {
                        setShowComplaint(false);
                        if (onCloseComplaint) onCloseComplaint();
                      }}
                    >
                      বাতিল
                    </button>
                    <button type="submit" className="gcc-complaint-submit" id="gcc-complaint-submit">
                      জমা দিন
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        id="gcc-toggle"
        title="লাইভ সহায়তা"
        aria-label="Open live chat"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="gcc-toggle-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
