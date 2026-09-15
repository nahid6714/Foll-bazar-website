'use client';

import React, { useState, useEffect } from 'react';
import { flashSaleProducts, Product } from '@/lib/data';
import ProductCard from './ProductCard';

interface FlashSaleSectionProps {
  onOrderProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function FlashSaleSection({ onOrderProduct, onAddToCart }: FlashSaleSectionProps) {
  // Real countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '14',
    minutes: '38',
    seconds: '45',
  });

  useEffect(() => {
    // Target date matching Screenshot 3 (~420 days countdown)
    const target = new Date('2027-11-09T00:00:00.000Z');

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          minutes: m.toString().padStart(2, '0'),
          seconds: s.toString().padStart(2, '0'),
        });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flash-sale-section" id="flashSaleSection">
      <div className="container">
        <div className="flash-sale-head">
          <div className="flash-sale-heading">
            <span className="flash-sale-bolt">
              <i className="fas fa-bolt" aria-hidden="true"></i>
            </span>
            <div className="flash-sale-heading-text">
              <h2>FLASH SALE</h2>
              <p>ঝলমলে ছাড় — দ্রুত কিনুন!</p>
            </div>
          </div>

          <a
            href="#allProducts"
            className="flash-sale-viewall"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('allProducts');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            সব দেখুন <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </a>

          <div
            className="deal-countdown timer flash-sale-timer"
            id="flashTimer"
            role="timer"
            aria-label="কাউন্টডাউন টাইমার"
            data-end="2027-11-09T00:00:00.000000Z"
          >
            <div className="timer-box">
              <b id="flashDays">{timeLeft.days}</b>
              <small>দিন</small>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-box">
              <b id="flashHours">{timeLeft.hours}</b>
              <small>ঘণ্টা</small>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-box">
              <b id="flashMinutes">{timeLeft.minutes}</b>
              <small>মিনিট</small>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-box">
              <b id="flashSeconds">{timeLeft.seconds}</b>
              <small>সেকেন্ড</small>
            </div>
          </div>
        </div>

        <div className="flash-sale-grid product-grid">
          {flashSaleProducts.map((p) => (
            <ProductCard
              key={p.id + '-' + p.title}
              product={p}
              onOrderProduct={onOrderProduct}
              onAddToCart={onAddToCart}
              showProgress={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
