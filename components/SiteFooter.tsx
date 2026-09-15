'use client';

import React, { useState } from 'react';

interface SiteFooterProps {
  onOpenTrackModal: () => void;
  onOpenComplaintModal: () => void;
}

export default function SiteFooter({ onOpenTrackModal, onOpenComplaintModal }: SiteFooterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-logo">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://demo.scaleuper.com/public/uploads/settings/1783100466-footer.webp" alt="ফল বাজার" />
            </a>
          </div>
          <p className="footer-about">
            ফল বাজার হলো তাজা ও মানসম্মত আম কেনার একটি অনলাইন প্ল্যাটফর্ম। আমরা সরাসরি বাগান থেকে সংগ্রহ করা ফ্রেশ আম গ্রাহকের হাতে পৌঁছে দিই দ্রুত ও নিরাপদ ডেলিভারির মাধ্যমে।
          </p>
          <div className="footer-social">
            <a href="https://www.facebook.com/scaleuper" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/scaleuper" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://wa.me/+8801810502120" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="https://youtube.com/@scaleuper" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://instagram.com/scaleuper" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">প্রয়োজনীয় লিঙ্ক</h3>
          <ul className="footer-links">
            <li>
              <a href="#contact" onClick={(e) => { e.preventDefault(); alert('আমাদের সাথে যোগাযোগ: 01810502120 অথবা ইমেইল করুন support@scaleuper.com'); }}>
                যোগাযোগ
              </a>
            </li>
            <li>
              <a href="#how-to-order" onClick={(e) => { e.preventDefault(); alert('অর্ডার করতে যেকোনো পণ্যের "অর্ডার করুন" বাটনে ক্লিক করুন, আপনার নাম-ঠিকানা দিন এবং কনফার্ম করুন!'); }}>
                কিভাবে অর্ডার করবেন
              </a>
            </li>
            <li>
              <a href="#delivery-terms" onClick={(e) => { e.preventDefault(); alert('ডেলিভারি শর্ত: ঢাকার ভিতরে ১-২ কার্যদিবস (চার্জ ৳৮০), ঢাকার বাইরে ২-৩ কার্যদিবস (চার্জ ৳১৫০)।'); }}>
                ডেলিভারির শর্ত
              </a>
            </li>
            <li>
              <a href="#return-policy" onClick={(e) => { e.preventDefault(); alert('রিটার্ন পলিসি: লিচুতে কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের সামনে চেক করে সাথে সাথে রিটার্ন করতে পারবেন।'); }}>
                রিট্রান পলিসি
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">আমাদের গ্রাহক সেবা</h3>
          <ul className="footer-links">
            <li>
              <a href="#login" onClick={(e) => { e.preventDefault(); alert('অতিথি গ্রাহক হিসেবে সরাসরি অর্ডার করতে পারেন!'); }}>
                আমার অ্যাকাউন্ট
              </a>
            </li>
            <li>
              <a href="#track" onClick={(e) => { e.preventDefault(); onOpenTrackModal(); }}>
                অর্ডার ট্র্যাক করুন
              </a>
            </li>
            <li>
              <a href="#complaint" onClick={(e) => { e.preventDefault(); onOpenComplaintModal(); }}>
                কমপ্লেইন করুন
              </a>
            </li>
            <li>
              <a href="#blog" onClick={(e) => { e.preventDefault(); alert('ব্লগ আর্টিকেলে দিনাজপুরের বিখ্যাত বেদানা ও বোম্বাই লিচুর বৈশিষ্ট্য সম্পর্কে জানুন!'); }}>
                আমাদের ব্লগ
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">নিউজলেটার</h3>
          <p className="footer-news-text">আমাদের সবশেষ অফার ও ডিসকাউন্টের আপডেট পেতে সাবস্ক্রাইব করুন।</p>
          <form className="footer-newsletter" onSubmit={handleSubscribe}>
            <input
              type="email"
              name="email"
              placeholder="আপনার ইমেইল দিন..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" aria-label="সাবস্ক্রাইব">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          {subscribed && (
            <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '6px' }}>
              ✓ ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।
            </p>
          )}

          <div className="footer-apps">
            <span className="footer-apps-title">আমাদের অ্যাপ ডাউনলোড করুন</span>
            <div className="footer-app-badges">
              <a href="#" onClick={(e) => e.preventDefault()} className="app-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/play.svg" alt="Google Play" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="app-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/app.png" alt="App Store" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            &copy; 2026 সকল কিছুর স্বত্বাধিকারঃ <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>ফল বাজার</a> | সকল কারিগরি সহযোগিতায়{' '}
            <a href="https://scaleuper.com" target="_blank" rel="noopener noreferrer">
              Scale Uper
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
