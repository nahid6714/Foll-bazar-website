'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSiteData } from '@/lib/site-data';

const MOBILE_FRAME_HEIGHT = 320;

export default function HeroSlider() {
  const { heroBanners } = useSiteData();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const total = heroBanners.length;
  const activeBanner = heroBanners[current] ?? heroBanners[0];

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
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, total]);

  if (total === 0) return null;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(delta) < 45 || total <= 1) return;
    if (delta < 0) nextSlide();
    else prevSlide();
  };

  return (
    <section className="hero-banner">
      <div
        className="hero-slider"
        id="heroSlider"
        aria-label="হিরো ব্যানার স্লাইডার"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ ['--hero-frame-height' as any]: `${MOBILE_FRAME_HEIGHT}px` }}
      >
        <div
          className="hero-track"
          id="heroTrack"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {heroBanners.map((banner, index) => {
            const widthPercent = Math.min(100, Math.max(50, Number(banner.widthPercent ?? 100)));
            const heightPx = Math.min(500, Math.max(120, Number(banner.heightPx ?? 320)));
            // Admin height controls the image's size INSIDE the fixed frame.
            // The frame itself never grows/shrinks, preventing layout jumps.
            const heightPercent = Math.min(100, Math.max(38, (heightPx / MOBILE_FRAME_HEIGHT) * 100));

            return (
              <div
                key={banner.id}
                className={`hero-slide ${index === current ? 'active' : ''}`}
                style={{
                  ['--banner-width' as any]: `${widthPercent}%`,
                  ['--banner-height-percent' as any]: `${heightPercent}%`,
                }}
              >
                <a
                  href={banner.linkUrl || '#'}
                  onClick={(e) => { if (!banner.linkUrl) e.preventDefault(); }}
                  className="hero-link"
                  aria-label={banner.alt}
                >
                  <span className="hero-image-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="hero-img"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      width={1920}
                      height={600}
                    />
                  </span>
                </a>
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button type="button" className="hero-nav hero-arrow hero-prev" id="heroPrev" aria-label="পূর্ববর্তী স্লাইড" onClick={prevSlide}>
              <i className="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button type="button" className="hero-nav hero-arrow hero-next" id="heroNext" aria-label="পরবর্তী স্লাইড" onClick={nextSlide}>
              <i className="fas fa-chevron-right" aria-hidden="true"></i>
            </button>

            <div className="hero-dots" id="heroDots" aria-label="ব্যানার নির্বাচন">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`hero-dot ${index === current ? 'active' : ''}`}
                  aria-label={`ব্যানার ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                  onClick={() => setCurrent(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
