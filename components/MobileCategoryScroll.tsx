'use client';

import React, { useState } from 'react';
import { categories } from '@/lib/data';

interface MobileCategoryScrollProps {
  onSelectCategory?: (slug: string) => void;
}

export default function MobileCategoryScroll({ onSelectCategory }: MobileCategoryScrollProps) {
  const [activeSlug, setActiveSlug] = useState<string>(categories[0]?.slug || '');

  return (
    <nav className="mobile-category-scroll" aria-label="ক্যাটাগরি">
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <a
            key={cat.slug}
            href={`#${cat.slug}`}
            className={`category-chip ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSlug(cat.slug);
              if (onSelectCategory) {
                onSelectCategory(cat.slug);
              }
              const el = document.getElementById(cat.slug) || document.getElementById('allProducts');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {cat.name}
          </a>
        );
      })}
    </nav>
  );
}
