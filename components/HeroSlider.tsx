'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSiteData } from '@/lib/site-data';

const SWIPE_THRESHOLD = 45;

export default function HeroSlider() {
  const { heroBanners } = useSiteData();
  const [current, setCurrent] = useState(0);
  const total = heroBanners.length;
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const suppressClickUntil = useRef(0);

  const nextSlide = useCallback(() => {
    if (total > 1) setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total > 1) setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (current >= total && total > 0) setCurrent(0);
  }, [current, total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = window.setInterval(nextSlide, 4500);
    return () => window.clearInterval(timer);
  }, [nextSlide, total]);

  if (total === 0) {
    // Keep the hero area reserved while Supabase banners are loading.
    return <section className="fb-hero-banner fb-hero-loading" aria-label="হিরো ব্যানার লোড হচ্ছে" />;
  }

  const beginTouch = (x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    didSwipe.current = false;
  };

  const endTouch = (x: number, y: number) => {
    if (startX.current == null || startY.current == null || total <= 1) return;
    const dx = x - startX.current;
    const dy = y - startY.current;
    const horizontal = Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy);
    if (horizontal) {
      didSwipe.current = true;
      suppressClickUntil.current = Date.now() + 650;
      if (dx < 0) nextSlide();
      else prevSlide();
    }
    startX.current = null;
    startY.current = null;
  };

  return (
    <section className="fb-hero-banner" aria-label="হিরো ব্যানার">
      <div
        className="fb-hero-slider"
        aria-label="হিরো ব্যানার স্লাইডার"
        onTouchStart={(e) => {
          if (e.touches.length === 1) beginTouch(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (t) endTouch(t.clientX, t.clientY);
        }}
        onTouchCancel={() => { startX.current = null; startY.current = null; }}
      >
        <div
          className="fb-hero-track"
          style={{ transform: `translate3d(-${current * 100}%, 0, 0)` }}
        >
          {heroBanners.map((banner, index) => (
            <div key={banner.id} className="fb-hero-slide">
              <a
                href={banner.linkUrl || '#'}
                className="fb-hero-link"
                aria-label={banner.alt}
                draggable={false}
                onClick={(e) => {
                  if (didSwipe.current || Date.now() < suppressClickUntil.current || !banner.linkUrl) e.preventDefault();
                  didSwipe.current = false;
                }}
              >
                <span className="fb-hero-image-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="fb-hero-img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    draggable={false}
                  />
                </span>
              </a>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              className="fb-hero-nav fb-hero-prev"
              aria-label="পূর্ববর্তী স্লাইড"
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              className="fb-hero-nav fb-hero-next"
              aria-label="পরবর্তী স্লাইড"
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="fb-hero-dots" aria-label="ব্যানার নির্বাচন">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`fb-hero-dot ${index === current ? 'active' : ''}`}
                  aria-label={`ব্যানার ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(index); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
