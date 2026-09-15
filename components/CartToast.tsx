'use client';

import React from 'react';

interface CartToastProps {
  message: string | null;
}

export default function CartToast({ message }: CartToastProps) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999999,
        backgroundColor: '#16a34a',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 600,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  );
}
