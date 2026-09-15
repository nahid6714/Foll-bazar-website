'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { heroBanners } from '@/lib/data';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const total = heroBanners.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="hero-banner">
      <div className="hero-slider" id="heroSlider" aria-label="হিরো ব্যানার স্লাইডার" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className="hero-track"
          id="heroTrack"
          style={{
            display: 'flex',
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {heroBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`hero-slide ${index === current ? 'active' : ''}`}
              style={{ minWidth: '100%', flexShrink: 0 }}
            >
              <a href="#" onClick={(e) => e.preventDefault()} className="hero-link" style={{ display: 'block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="hero-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </a>
            </div>
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <button
          type="button"
          className="hero-arrow hero-prev"
          id="heroPrev"
          aria-label="পূর্ববর্তী স্লাইড"
          onClick={prevSlide}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          type="button"
          className="hero-arrow hero-next"
          id="heroNext"
          aria-label="পরবর্তী স্লাইড"
          onClick={nextSlide}
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Indicator Dots */}
        <div className="hero-dots" id="heroDots" role="tablist" aria-label="স্লাইড নির্বাচন">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-dot ${i === current ? 'active' : ''}`}
              role="tab"
              aria-label={`স্লাইড ${i + 1}`}
              aria-selected={i === current}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
