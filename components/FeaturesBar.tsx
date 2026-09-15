'use client';

import React from 'react';

export default function FeaturesBar() {
  return (
    <section className="features-bar">
      <div className="container features-grid">
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-leaf"></i>
          </div>
          <div className="feature-text">
            <h4>খাঁটি অর্গানিক আম</h4>
            <p>প্রাকৃতিক ও নিরাপদ উপাদান।</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-truck-fast"></i>
          </div>
          <div className="feature-text">
            <h4>দ্রুত ডেলিভারি</h4>
            <p>সারা দেশে দ্রুত পৌঁছে যায়।</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div className="feature-text">
            <h4>নিরাপদ পেমেন্ট</h4>
            <p>১০০% সুরক্ষিত লেনদেন ব্যবস্থা।</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-headset"></i>
          </div>
          <div className="feature-text">
            <h4>সহজ সাপোর্ট</h4>
            <p>দ্রুত সহায়তা সবসময় প্রস্তুত।</p>
          </div>
        </div>
      </div>
    </section>
  );
}
