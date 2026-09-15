'use client';

import React, { useState } from 'react';

interface MobileBottomNavProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
}

export default function MobileBottomNav({ cartCount, onOpenCart, onOpenLogin }: MobileBottomNavProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'cart' | 'login'>('home');

  return (
    <nav className="mobile-bottom-nav" aria-label="মোবাইল নেভিগেশন">
      <a
        href="#"
        className={activeTab === 'home' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>হোম</span>
      </a>

      <a
        href="#allProducts"
        className={activeTab === 'shop' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('shop');
          const el = document.getElementById('allProducts');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span>শপ</span>
      </a>

      <a
        href="#cart"
        id="mobileCartBtn"
        className={activeTab === 'cart' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('cart');
          onOpenCart();
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        <span>কার্ট</span>
      </a>

      <a
        href="#login"
        className={activeTab === 'login' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('login');
          onOpenLogin();
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>লগইন</span>
      </a>
    </nav>
  );
}

