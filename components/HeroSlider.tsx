'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSiteData } from '@/lib/site-data';

const MOBILE_FRAME_HEIGHT = 250;
const SWIPE_THRESHOLD = 35;

export default function HeroSlider() {
  const { heroBanners } = useSiteData();
  const [current, setCurrent] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const swiping = useRef(false);
  const suppressClickUntil = useRef(0);
  const total = heroBanners.length;

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

  if (total === 0) return null;

  const resetPointer = () => {
    pointerStartX.current = null;
    pointerStartY.current = null;
    pointerId.current = null;
    swiping.current = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' || total <= 1) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    pointerId.current = e.pointerId;
    swiping.current = false;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId || pointerStartX.current == null || pointerStartY.current == null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - pointerStartY.current;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      swiping.current = true;
      e.preventDefault();
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId || pointerStartX.current == null || pointerStartY.current == null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - pointerStartY.current;
    const horizontal = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD;

    if (horizontal && total > 1) {
      swiping.current = true;
      suppressClickUntil.current = Date.now() + 500;
      if (dx < 0) nextSlide();
      else prevSlide();
    }

    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    resetPointer();
  };

  return (
    <section className="fb-hero-banner" aria-label="হিরো ব্যানার">
      <div
        className="fb-hero-slider"
        id="heroSlider"
        aria-label="হিরো ব্যানার স্লাইডার"
        style={{ ['--fb-hero-height' as any]: `${MOBILE_FRAME_HEIGHT}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="fb-hero-track"
          id="heroTrack"
          style={{ transform: `translate3d(-${current * 100}%, 0, 0)` }}
        >
          {heroBanners.map((banner, index) => {
            const widthPercent = Math.min(100, Math.max(50, Number(banner.widthPercent ?? 100)));
            const heightPx = Math.min(MOBILE_FRAME_HEIGHT, Math.max(100, Number(banner.heightPx ?? MOBILE_FRAME_HEIGHT)));
            const heightPercent = Math.min(100, Math.max(40, (heightPx / MOBILE_FRAME_HEIGHT) * 100));

            return (
              <div
                key={banner.id}
                className="fb-hero-slide"
                style={{
                  ['--fb-banner-width' as any]: `${widthPercent}%`,
                  ['--fb-banner-height' as any]: `${heightPercent}%`,
                }}
              >
                <a
                  href={banner.linkUrl || '#'}
                  className="fb-hero-link"
                  aria-label={banner.alt}
                  draggable={false}
                  onClick={(e) => {
                    if (Date.now() < suppressClickUntil.current || !banner.linkUrl) e.preventDefault();
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
                      width={1920}
                      height={600}
                      draggable={false}
                    />
                  </span>
                </a>
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              className="fb-hero-nav fb-hero-prev"
              id="heroPrev"
              aria-label="পূর্ববর্তী স্লাইড"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              className="fb-hero-nav fb-hero-next"
              id="heroNext"
              aria-label="পরবর্তী স্লাইড"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="fb-hero-dots" id="heroDots" aria-label="ব্যানার নির্বাচন">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`fb-hero-dot ${index === current ? 'active' : ''}`}
                  aria-label={`ব্যানার ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setCurrent(index); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
