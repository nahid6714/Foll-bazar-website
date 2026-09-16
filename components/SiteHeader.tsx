'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CartItem, Product } from '@/lib/data';
import { useSiteData } from '@/lib/site-data';

interface SiteHeaderProps {
  cart: CartItem[];
  onUpdateCartQty: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  onOpenOrderModal: (product?: Product | null) => void;
  onOpenTrackModal: () => void;
  onOpenComplaintModal: () => void;
  allProducts: Product[];
  onNavigateToHome?: () => void;
  onNavigateToShop?: (categorySlug?: string | null) => void;
  onViewProductDetails?: (product: Product) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  currentUser?: { name: string; phone: string; email?: string } | null;
  onOpenCartPage?: () => void;
}

export default function SiteHeader({
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  onOpenOrderModal,
  onOpenTrackModal,
  onOpenComplaintModal,
  allProducts,
  onNavigateToHome,
  onNavigateToShop,
  onViewProductDetails,
  onOpenAuth,
  currentUser,
  onOpenCartPage,
}: SiteHeaderProps) {
  const { categories } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubCat, setOpenSubCat] = useState<string | null>(null);
  const [openChildCat, setOpenChildCat] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Derived search state
  const isSearchActive = searchQuery.trim().length >= 2;
  const searchResults = isSearchActive
    ? allProducts.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  // Toggle menu-open class on body when mobile drawer opens
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <button
            className="menu-toggle md:hidden"
            id="menuToggle"
            aria-label="মেনু খুলুন"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 2H21M1 9H21M1 16H21" stroke="#df2d4d" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>

          <a
            href="#"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToHome) {
                onNavigateToHome();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://demo.scaleuper.com/public/uploads/settings/1783100404-logo.webp"
              alt="ফল বাজার - লিচু"
            />
          </a>

          {/* Search Bar */}
          <div className="mobile-search relative" ref={searchRef}>
            <input
              type="search"
              name="keyword"
              id="mobileSearchInput"
              placeholder="পণ্য খুঁজুন..."
              aria-label="পণ্য খুঁজুন"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>

            {/* Live Search Results */}
            {isSearchActive && (
              <div className="mobile-search-results show" id="mobileSearchResults" aria-live="polite">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="search_product"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setSearchQuery('');
                        if (onViewProductDetails) {
                          onViewProductDetails(item);
                        } else {
                          onOpenOrderModal(item);
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#df2d4d', fontWeight: 600 }}>৳{item.price}</div>
                      </div>
                      <button
                        type="button"
                        className="btn-order vom-btn"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                          onOpenOrderModal(item);
                        }}
                      >
                        অর্ডার
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="mobile-search-state" style={{ padding: '14px', textAlign: 'center', color: '#6b7280' }}>
                    কোনো পণ্য পাওয়া যায়নি
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            <div
              className="cart-wrap"
              onMouseEnter={() => setIsCartOpen(true)}
              onMouseLeave={() => setIsCartOpen(false)}
            >
              <button
                type="button"
                className="cart-btn"
                aria-label="কার্ট"
                onClick={() => {
                  if (onOpenCartPage) {
                    setIsCartOpen(false);
                    onOpenCartPage();
                  } else {
                    setIsCartOpen(!isCartOpen);
                  }
                }}
              >
                <span className="cart-amount">{cartTotal}৳</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span className="cart-count" id="cart-qty">
                  {cartCount}
                </span>
              </button>

              {/* Mini Cart Dropdown */}
              <div
                className="cart-dropdown"
                id="miniCart"
                style={{
                  display: isCartOpen ? 'block' : 'none',
                  opacity: isCartOpen ? 1 : 0,
                  pointerEvents: isCartOpen ? 'auto' : 'none',
                  transform: isCartOpen ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="cart-dropdown-head">
                  <span className="cart-dropdown-title">আপনার কার্ট</span>
                  <span className="cart-dropdown-count">{cartCount} টি পণ্য</span>
                </div>

                <div className="cart-dropdown-body" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {cart.length === 0 ? (
                    <div className="mini-cart-empty">
                      <i className="fas fa-cart-shopping"></i>
                      <p>আপনার কার্ট খালি</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="mini-cart-item"
                        data-id={item.id}
                        data-line={item.price * item.quantity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#1f2937',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#df2d4d' }}>৳{item.price}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>x {item.quantity}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.id, -1)}
                              style={{
                                width: '22px',
                                height: '22px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                              }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.id, 1)}
                              style={{
                                width: '22px',
                                height: '22px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mini-cart-remove"
                          onClick={() => onRemoveFromCart(item.id)}
                          aria-label="পণ্য মুছুন"
                          style={{
                            color: '#9ca3af',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="cart-dropdown-foot" style={{ display: 'block' }}>
                    <div className="mini-cart-total">
                      <span>সর্বমোট</span>
                      <span className="mini-cart-total-amt">৳{cartTotal}</span>
                    </div>
                    <div className="mini-cart-actions">
                      <button
                        type="button"
                        className="mini-cart-view"
                        onClick={() => {
                          setIsCartOpen(false);
                          if (onOpenCartPage) {
                            onOpenCartPage();
                          } else {
                            onOpenOrderModal(null);
                          }
                        }}
                      >
                        কার্ট দেখুন
                      </button>
                      <button
                        type="button"
                        className="mini-cart-checkout"
                        onClick={() => {
                          setIsCartOpen(false);
                          if (onOpenCartPage) {
                            onOpenCartPage();
                          } else {
                            onOpenOrderModal(null);
                          }
                        }}
                      >
                        অর্ডার করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <a
              href="tel:01810502120"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-[#df2d4d] text-xs font-semibold hover:bg-red-100 transition border border-red-100"
              title="হটলাইন"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>01810502120</span>
            </a>

            <button
              type="button"
              className="profile-btn hidden md:inline-flex"
              aria-label={currentUser ? currentUser.name : 'আমার অ্যাকাউন্ট'}
              title={currentUser ? currentUser.name : 'আমার অ্যাকাউন্ট'}
              onClick={() => {
                if (onOpenAuth) {
                  onOpenAuth('login');
                } else {
                  alert('স্বাগতম! ফল বাজার-এ আপনি অতিথি হিসেবে সরাসরি অর্ডার করতে পারেন।');
                }
              }}
            >
              {currentUser ? (
                <span className="font-bold text-xs uppercase select-none">
                  {currentUser.name.slice(0, 2)}
                </span>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="btn-track hidden md:inline-flex"
              onClick={onOpenTrackModal}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation Bar - Matching demo.scaleuper.com */}
        <div className="hidden md:block border-t border-gray-100 bg-white shadow-xs">
          <div className="container flex items-center justify-between py-2 text-sm font-medium">
            <div className="flex items-center gap-6">
              {/* All Categories Dropdown Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => onNavigateToShop ? onNavigateToShop(null) : undefined}
                  className="flex items-center gap-2 bg-[#df2d4d] text-white px-4 py-2 rounded-lg font-semibold text-xs tracking-wide hover:bg-[#c8233f] transition shadow-xs cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="4" x2="20" y1="12" y2="12"/>
                    <line x1="4" x2="20" y1="6" y2="6"/>
                    <line x1="4" x2="20" y1="18" y2="18"/>
                  </svg>
                  <span>সকল ক্যাটাগরি</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                  <button
                    type="button"
                    onClick={() => onNavigateToShop ? onNavigateToShop(null) : undefined}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-red-50 hover:text-[#df2d4d] flex items-center justify-between cursor-pointer"
                  >
                    <span>সকল পণ্য</span>
                    <span className="text-gray-400">→</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={`cat-drop-${cat.slug}`}
                      type="button"
                      onClick={() => onNavigateToShop ? onNavigateToShop(cat.slug) : undefined}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-[#df2d4d] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Nav Links */}
              <nav className="flex items-center gap-5 text-gray-700 text-sm">
                <button
                  type="button"
                  onClick={onNavigateToHome}
                  className="hover:text-[#df2d4d] transition font-medium cursor-pointer"
                >
                  হোম
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToShop ? onNavigateToShop(null) : undefined}
                  className="hover:text-[#df2d4d] transition font-medium cursor-pointer"
                >
                  শপ
                </button>
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={`nav-link-${cat.slug}`}
                    type="button"
                    onClick={() => onNavigateToShop ? onNavigateToShop(cat.slug) : undefined}
                    className="hover:text-[#df2d4d] transition font-medium whitespace-nowrap cursor-pointer text-gray-700"
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('flashSale');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else if (onNavigateToShop) {
                      onNavigateToShop(null);
                    }
                  }}
                  className="text-[#df2d4d] hover:text-[#c8233f] transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>🔥 অফার / হট ডিল</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer (Shown only on mobile <= 768px/900px) */}
      <nav
        className={`main-nav md:hidden ${isMenuOpen ? 'open' : ''}`}
        id="mainNav"
        aria-label="মোবাইল প্রধান মেনু"
      >
        <div className="drawer-head">
          <span className="drawer-title">মোবাইল মেন্যু</span>
          <button
            type="button"
            className="drawer-close"
            id="menuClose"
            aria-label="মেনু বন্ধ করুন"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mobile Drawer Account / Profile Section */}
        <div className="drawer-only-block bg-gradient-to-r from-red-50 to-pink-50/50 p-4 border-b border-red-100/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#df2d4d] text-white flex items-center justify-center shrink-0 shadow-xs">
                {currentUser ? (
                  <span className="font-bold text-sm uppercase">
                    {currentUser.name.slice(0, 2)}
                  </span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {currentUser ? currentUser.name : 'আমার অ্যাকাউন্ট'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser ? (currentUser.phone || currentUser.email || 'লগইন সম্পন্ন') : 'লগইন বা রেজিস্টার করুন'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                if (onOpenAuth) onOpenAuth('login');
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-md bg-[#df2d4d] text-white text-xs font-semibold hover:bg-[#c8233f] transition shadow-xs cursor-pointer"
            >
              {currentUser ? 'প্রোফাইল' : 'লগইন'}
            </button>
          </div>
        </div>

        <div className="drawer-links">
          <a
            href="#"
            className="drawer-only"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              if (onNavigateToHome) {
                onNavigateToHome();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df2d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>হোম</span>
          </a>

          <a
            href="#shop"
            className="drawer-only"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              if (onNavigateToShop) {
                onNavigateToShop(null);
              } else {
                const el = document.getElementById('allProducts');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df2d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>শপ (ফিল্টারসহ সকল পণ্য)</span>
          </a>

          {/* Mobile Categories in Drawer - No images, pure clean text */}
          <div className="nav-cat-mobile drawer-only-block">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className={`mobile-cat-group ${cat.hasSubmenu ? 'has-children' : ''} ${openSubCat === cat.slug ? 'is-open' : ''}`}
              >
                <div className="mobile-cat-row">
                  <a
                    href={`#${cat.slug}`}
                    className="mobile-cat-parent"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      if (onNavigateToShop) {
                        onNavigateToShop(cat.slug);
                      } else {
                        const el = document.getElementById(cat.slug) || document.getElementById('allProducts');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <span>{cat.name}</span>
                  </a>
                  {cat.hasSubmenu && (
                    <button
                      type="button"
                      className="mobile-sub-toggle"
                      aria-expanded={openSubCat === cat.slug}
                      aria-label={`${cat.name} সাব ক্যাটাগরি`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenSubCat(openSubCat === cat.slug ? null : cat.slug);
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#df2d4d"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: openSubCat === cat.slug ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
                {cat.hasSubmenu && openSubCat === cat.slug && (
                  <div className="drawer-sub-links">
                    <div className={`drawer-sub-group ${openChildCat === 'demo' ? 'has-children is-open' : 'has-children'}`}>
                      <div
                        className="drawer-sub-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 20px 12px 24px',
                        }}
                      >
                        <a
                          href="#demo"
                          onClick={(e) => e.preventDefault()}
                          className="drawer-sub-parent"
                          style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}
                        >
                          demo
                        </a>
                        <button
                          type="button"
                          className="drawer-child-toggle"
                          onClick={() => setOpenChildCat(openChildCat === 'demo' ? null : 'demo')}
                          style={{ background: 'none', border: 'none', color: '#df2d4d', padding: '6px 12px', cursor: 'pointer' }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#df2d4d"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              transform: openChildCat === 'demo' ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                            aria-hidden="true"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                      {openChildCat === 'demo' && (
                        <div className="drawer-child-links" style={{ padding: '4px 0 10px 44px' }}>
                          <a
                            href="#demo"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsMenuOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 0',
                              fontSize: '13px',
                              color: '#4b5563',
                            }}
                          >
                            <span>&minus; demo</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <a
            href="#track-order"
            className="drawer-only"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              onOpenTrackModal();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df2d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 17h4V5H2v12h3"/>
              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/>
              <circle cx="7.5" cy="17.5" r="2.5"/>
              <circle cx="17.5" cy="17.5" r="2.5"/>
            </svg>
            <span>Track Order</span>
          </a>
          <a
            href="#complaint"
            className="drawer-only"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              onOpenComplaintModal();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df2d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
              <path d="M21 16v2a3 3 0 0 1-3 3h-5"/>
            </svg>
            <span>কমপ্লেইন</span>
          </a>
          <a
            href="#account"
            className="drawer-only"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              if (onOpenAuth) {
                onOpenAuth('login');
              } else {
                onOpenTrackModal();
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df2d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{currentUser ? currentUser.name : 'আমার অ্যাকাউন্ট (লগইন)'}</span>
          </a>
        </div>
      </nav>

      {/* Nav Overlay for mobile drawer */}
      <div
        className={`nav-overlay md:hidden ${isMenuOpen ? 'show' : ''}`}
        id="navOverlay"
        aria-hidden={!isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      ></div>
    </>
  );
}
