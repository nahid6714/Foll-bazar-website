'use client';

import React from 'react';

export default function HomeLoadingSkeleton() {
  return (
    <div className="home-loading-skeleton" aria-label="লোড হচ্ছে" aria-busy="true">
      <section className="home-skeleton-hero">
        <div className="skeleton-shimmer" />
      </section>
      <section className="home-skeleton-flash">
        <div className="skeleton-bolt" />
        <div className="skeleton-flash-lines">
          <span className="skeleton-line wide" />
          <span className="skeleton-line medium" />
        </div>
        <div className="skeleton-timer-row">
          <span /><span /><span /><span />
        </div>
      </section>
      <section className="home-skeleton-products">
        <span className="skeleton-line title" />
        <div className="home-skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="home-skeleton-card" key={i}>
              <div className="skeleton-card-image skeleton-shimmer" />
              <div className="skeleton-card-line wide" />
              <div className="skeleton-card-line short" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
