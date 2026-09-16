'use client';

import React, { useState } from 'react';
import { useSiteData } from '@/lib/site-data';

interface MobileCategoryScrollProps {
  onSelectCategory?: (slug: string) => void;
  activeCategory?: string | null;
}

export default function MobileCategoryScroll({ onSelectCategory, activeCategory }: MobileCategoryScrollProps)
  {
  const { categories } = useSiteData();
  const [internalSlug, setInternalSlug] = useState<string>(categories[0]?.slug || '');
  const activeSlug = activeCategory !== undefined ? (activeCategory || '') : internalSlug;

  return (
    <nav className="mobile-category-scroll md:hidden" aria-label="ক্যাটাগরি">
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <a
            key={cat.slug}
            href={`#${cat.slug}`}
            className={`category-chip ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setInternalSlug(cat.slug);
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
