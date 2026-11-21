import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface AmbientBackgroundProps {
  variant?: 'dark' | 'light' | 'fintech'
  showGrid?: boolean
  className?: string
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'fintech',
  showGrid = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const orb4Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Floating animation for glowing orbs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: '+=60',
          y: '+=40',
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: '-=50',
          y: '+=50',
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        })
      }

      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: '+=40',
          y: '-=60',
          duration: 13,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        })
      }

      if (orb4Ref.current) {
        gsap.to(orb4Ref.current, {
          scale: 1.15,
          opacity: 0.6,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Dynamic Ambient Gradient Orbs */}
      <div
        ref={orb1Ref}
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] will-change-transform"
      />
      <div
        ref={orb2Ref}
        className="absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-[130px] will-change-transform"
      />
      <div
        ref={orb3Ref}
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-cyan-600/12 via-blue-600/8 to-transparent blur-[140px] will-change-transform"
      />
      <div
        ref={orb4Ref}
        className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-transparent blur-[110px] will-change-transform opacity-40"
      />

      {/* Subtle Micro-Grid Texture */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
          }}
        />
      )}

      {/* Fine Scanline Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.015] to-transparent pointer-events-none" />
    </div>
  )
}

export default AmbientBackground
