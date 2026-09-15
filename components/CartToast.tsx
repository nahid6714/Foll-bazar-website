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
        top: '92px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999999,
        width: 'min(90vw, 520px)',
        backgroundColor: '#df2d4d',
        color: '#fff',
        padding: '13px 18px',
        borderRadius: '12px',
        border: '2px solid #fff',
        boxShadow: '0 10px 25px rgba(223, 45, 77, 0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        fontSize: '14px',
        fontWeight: 600,
        textAlign: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  );
}
