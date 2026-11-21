import React from 'react'

export const StaticGradientMesh: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#F1F3F7] to-[#E8ECF4] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Mist Blue Ambient Glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #DBEAFE 0%, rgba(219, 234, 254, 0) 70%)',
        }}
      />

      {/* Subtle Warm Champagne Glow */}
      <div
        className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #FEF3C7 0%, rgba(254, 243, 199, 0) 70%)',
        }}
      />

      {/* CSS / SVG Drawn Faint Orbit Sculpture Illustration Behind Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] pointer-events-none opacity-40">
        <svg viewBox="0 0 720 720" className="w-full h-full">
          {/* Outer Navy Orbit Ring */}
          <ellipse
            cx="360"
            cy="360"
            rx="320"
            ry="110"
            fill="none"
            stroke="#0F172A"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            transform="rotate(-25 360 360)"
            opacity="0.25"
          />
          {/* Middle Gold Orbit Ring */}
          <ellipse
            cx="360"
            cy="360"
            rx="250"
            ry="85"
            fill="none"
            stroke="#B8860B"
            strokeWidth="1.2"
            transform="rotate(35 360 360)"
            opacity="0.35"
          />
          {/* Inner Slate Orbit Ring */}
          <ellipse
            cx="360"
            cy="360"
            rx="180"
            ry="60"
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
            strokeDasharray="3 4"
            transform="rotate(-10 360 360)"
            opacity="0.2"
          />
          {/* Center Milestone Core */}
          <circle cx="360" cy="360" r="42" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.6" />
          <circle cx="360" cy="360" r="30" fill="#E2E8F0" opacity="0.5" />
          {/* Satellite Milestone Nodes */}
          <circle cx="530" cy="270" r="5" fill="#059669" opacity="0.8" />
          <circle cx="210" cy="420" r="6" fill="#B8860B" opacity="0.7" />
          <circle cx="440" cy="450" r="4" fill="#0F172A" opacity="0.6" />
        </svg>
      </div>

      {/* Faint Perspective Grid Floor */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #0F172A 1px, transparent 1px), linear-gradient(to bottom, #0F172A 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 60%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 60%, black 20%, transparent 80%)',
        }}
      />

      {/* Subtle Noise Texture Overlay (2-3% Opacity for film grain depth) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default StaticGradientMesh
