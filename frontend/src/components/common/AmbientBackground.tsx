import React from 'react'
import { AmbientUniverse3D } from './AmbientUniverse3D'

interface AmbientBackgroundProps {
  variant?: 'light' | 'nude' | 'mist'
  showGrid?: boolean
  className?: string
  interactive?: boolean
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'mist',
  showGrid = true,
  className = '',
  interactive = true,
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-slate-50/50 ${className}`}>
      {/* 3D WebGL Banking & Card Visualizer Canvas */}
      <AmbientUniverse3D interactive={interactive} speedMultiplier={0.7} />

      {/* Gentle Nude & Mist Blue Diffuse Lighting */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-slate-200/35 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[45vw] h-[45vw] rounded-full bg-stone-200/30 blur-[130px] pointer-events-none" />

      {/* Subtle Financial Architecture Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.45) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
          }}
        />
      )}

      {/* Light Edge Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-slate-100/40 pointer-events-none" />
    </div>
  )
}

export default AmbientBackground
