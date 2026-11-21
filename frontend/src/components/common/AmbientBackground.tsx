import React from 'react'
import { AmbientUniverse3D } from './AmbientUniverse3D'

interface AmbientBackgroundProps {
  variant?: 'dark' | 'light' | 'fintech'
  showGrid?: boolean
  className?: string
  interactive?: boolean
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'fintech',
  showGrid = true,
  className = '',
  interactive = true,
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 3D WebGL Live Universe Canvas */}
      <AmbientUniverse3D interactive={interactive} speedMultiplier={1} />

      {/* Cyber-Atmospheric Radial Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-[45vw] h-[45vw] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[35vw] h-[35vw] rounded-full bg-emerald-500/8 blur-[130px] pointer-events-none" />

      {/* Micro-mesh Grid Pattern */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
          }}
        />
      )}

      {/* Subtle Luminous Scanline Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none" />
    </div>
  )
}

export default AmbientBackground
