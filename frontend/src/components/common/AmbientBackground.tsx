import React from 'react'
import { AmbientUniverse3D } from './AmbientUniverse3D'

interface AmbientBackgroundProps {
  variant?: 'light' | 'nude' | 'mist' | 'dark'
  theme?: 'light' | 'dark'
  showGrid?: boolean
  className?: string
  interactive?: boolean
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'mist',
  theme = 'light',
  showGrid = true,
  className = '',
  interactive = true,
}) => {
  const isDark = theme === 'dark'

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500 ${
        isDark ? 'bg-[#090e1a]' : 'bg-slate-50/50'
      } ${className}`}
    >
      {/* 3D WebGL Banking & Card Visualizer Canvas */}
      <AmbientUniverse3D theme={theme} interactive={interactive} speedMultiplier={0.7} />

      {/* Atmospheric Banking Lighting (Warm Gold & Midnight Slate) */}
      {isDark ? (
        <>
          <div className="absolute top-0 right-1/4 w-[45vw] h-[45vw] rounded-full bg-amber-950/20 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-slate-800/35 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[30vw] h-[30vw] rounded-full bg-blue-950/20 blur-[130px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-slate-200/35 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[45vw] h-[45vw] rounded-full bg-stone-200/30 blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Subtle Financial Architecture Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0)`
              : `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.45) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            opacity: isDark ? 0.45 : 0.035,
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
          }}
        />
      )}

      {/* Edge Vignette */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-b from-[#090e1a]/70 via-transparent to-[#090e1a]/85'
            : 'bg-gradient-to-b from-white/40 via-transparent to-slate-100/40'
        }`}
      />
    </div>
  )
}

export default AmbientBackground
