'use client';

import React, { useState, useEffect } from 'react';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show once per session or after 3 seconds
    const hasSeen = sessionStorage.getItem('scaleuper_promo_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('scaleuper_promo_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div
      id="promoPopupOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Promo Popup"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="promo-popup-box"
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="promo-popup-close"
          id="promoPopupClose"
          aria-label="বন্ধ করুন"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &times;
        </button>

        <a
          href="https://scaleuper.com"
          className="promo-popup-img-wrap"
          id="promoPopupImageLink"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://demo.scaleuper.com/public/uploads/popup/1788535582-6a9ae31eb92fa-790476147-122100861591462327-8108422166230026997-n.webp"
            alt="Promo Popup"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </a>
      </div>
    </div>
  );
}
