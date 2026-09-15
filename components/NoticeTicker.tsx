'use client';

import React, { useState } from 'react';

export default function NoticeTicker() {
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <div className="notice-ticker" id="noticeTicker" role="region" aria-label="বিশেষ ঘোষণা">
      <div className="notice-badge">
        <i className="fas fa-bolt" aria-hidden="true"></i>
        <span>SPECIAL NOTICE</span>
      </div>
      <div className="notice-track-wrap">
        <div className="notice-track">
          <span className="notice-text">
            ScaleUper Website Development • Digital Marketing • Social Media Marketing • A-Z Digital Solutions • আপনার ব্যবসার ডিজিটাল সাফল্যের সঙ্গী | ScaleUper Website Development • Digital Marketing
          </span>
          <span className="notice-text">
            ScaleUper Website Development • Digital Marketing • Social Media Marketing • A-Z Digital Solutions • আপনার ব্যবসার ডিজিটাল সাফল্যের সঙ্গী | ScaleUper Website Development • Digital Marketing
          </span>
        </div>
      </div>
      <button
        type="button"
        className="notice-close"
        id="noticeClose"
        aria-label="নোটিশ বন্ধ করুন"
        onClick={() => setIsClosed(true)}
      >
        <i className="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
  );
}

