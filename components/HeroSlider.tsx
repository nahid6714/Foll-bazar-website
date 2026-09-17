'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSiteData } from '@/lib/site-data';

export default function HeroSlider() {
  const { heroBanners } = useSiteData();
  const [current, setCurrent] = useState(0);
  const total = heroBanners.length;
  const activeBanner = heroBanners[current] ?? heroBanners[0];
  const activeHeight = Math.min(500, Math.max(120, Number(activeBanner?.heightPx ?? 220)));

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (current >= total && total > 0) setCurrent(0);
  }, [current, total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, total]);

  if (total === 0) return null;

  return (
    <section className="hero-banner">
      <div className="hero-slider" id="heroSlider" aria-label="হিরো ব্যানার স্লাইডার" style={{ position: 'relative', overflow: 'hidden', height: `${activeHeight}px` }}>
        <div
          className="hero-track"
          id="heroTrack"
          style={{
            display: 'flex',
            height: `${activeHeight}px`,
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {heroBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`hero-slide ${index === current ? 'active' : ''}`}
              style={{ minWidth: '100%', flexShrink: 0, ['--banner-height' as any]: `${Math.max(120, banner.heightPx)}px`, display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}
            >
              <a href={banner.linkUrl || '#'} onClick={(e) => { if (!banner.linkUrl) e.preventDefault(); }} className="hero-link" style={{ display: 'block', ['--banner-width' as any]: `${Math.min(100, Math.max(50, banner.widthPercent))}%`, height: '100%', margin: '0 auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="hero-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  width={1920}
                  height={600}
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', objectPosition: 'center' }}
                />
              </a>
            </div>
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <button
          type="button"
          className="hero-nav hero-arrow hero-prev"
          id="heroPrev"
          aria-label="পূর্ববর্তী স্লাইড"
          onClick={prevSlide}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          type="button"
          className="hero-nav hero-arrow hero-next"
          id="heroNext"
          aria-label="পরবর্তী স্লাইড"
          onClick={nextSlide}
        >
          <i className="fas fa-chevron-right"></i>
        </button>


      </div>
    </section>
  );
}
