'use client';

import React from 'react';

interface PromoSectionProps {
  image: string;
  alt?: string;
  onClick?: () => void;
}

export default function PromoSection({ image, alt = 'Promo banner', onClick }: PromoSectionProps) {
  return (
    <section className="promo-section">
      <div className="container">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
          }}
          style={{ display: 'block' }}
        >
          <div className="promo-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={alt} className="promo-banner-img" loading="lazy" />
          </div>
        </a>
      </div>
    </section>
  );
}
