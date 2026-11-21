import React from 'react'

export const StaticGradientMesh: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060B1A] ${className}`}
      aria-hidden="true"
    >
      {/* Primary Indigo Radial Nebula */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[65vw] h-[65vw] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #6366F1 0%, rgba(99, 102, 241, 0) 70%)',
        }}
      />

      {/* Accent Cyan Radial Nebula */}
      <div
        className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #22D3EE 0%, rgba(34, 211, 238, 0) 70%)',
        }}
      />

      {/* Subtle Central Deep Navy Layer */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #0B1226 0%, rgba(6, 11, 26, 0) 70%)',
        }}
      />

      {/* Faint Perspective Grid Floor */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
        }}
      />

      {/* Subtle Noise Texture Overlay (3% Opacity for film grain depth) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default StaticGradientMesh
