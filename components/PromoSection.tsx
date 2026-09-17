'use client';

import React from 'react';

interface PromoSectionProps {
  image: string;
  widthPercent?: number;
  heightPx?: number;
  linkUrl?: string | null;
  alt?: string;
  onClick?: () => void;
}

export default function PromoSection({ image, alt = 'Promo banner', onClick, widthPercent = 100, heightPx = 160, linkUrl }: PromoSectionProps) {
  return (
    <section className="promo-section">
      <div className="container">
        <a
          href={linkUrl || '#'}
          onClick={(e) => {
            if (!linkUrl) e.preventDefault();
            if (onClick) onClick();
          }}
          style={{ display: 'block' }}
        >
          <div className="promo-banner" style={{ ['--banner-width' as any]: `${Math.min(100, Math.max(50, widthPercent))}%`, ['--banner-height' as any]: `${Math.max(120, heightPx)}px`, margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={alt} className="promo-banner-img" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        </a>
      </div>
    </section>
  );
}
