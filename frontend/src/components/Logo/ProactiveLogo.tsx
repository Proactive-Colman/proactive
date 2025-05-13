import React from 'react';

export function ProactiveLogo({ size = 68 }: { size?: number }) {
  // Make the icon smaller relative to the text
  const iconSize = size * 0.7;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <circle cx="24" cy="24" r="22" fill="#22c55e" />
        <polyline
          points="16,25 22,31 32,19"
          fill="none"
          stroke="#23272b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          color: '#22c55e',
          fontWeight: 800,
          fontSize: size * 0.6,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: 1,
          lineHeight: 1,
        }}
      >
        Proactive
      </span>
    </div>
  );
} 