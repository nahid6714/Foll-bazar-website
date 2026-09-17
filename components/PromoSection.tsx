'use client';

import React from 'react';

interface PromoSectionProps {
  image: string;
  linkUrl?: string | null;
  alt?: string;
  onClick?: () => void;
}

export default function PromoSection({ image, alt = 'Promo banner', onClick, linkUrl }: PromoSectionProps) {
  return (
    <section className="promo-section">
      <div className="container">
        <a
          href={linkUrl || '#'}
          onClick={(e) => {
            if (!linkUrl) e.preventDefault();
            onClick?.();
          }}
          className="fb-promo-link"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className="promo-banner-img" loading="lazy" />
        </a>
      </div>
    </section>
  );
}
