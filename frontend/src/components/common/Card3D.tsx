import React, { useRef, useState } from 'react'

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'blue'
  maxTilt?: number
  enableGlare?: boolean
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  maxTilt = 7,
  enableGlare = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })

  const glowStyles = {
    cyan: 'hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    purple: 'hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    emerald: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    amber: 'hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    blue: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`,
      transition: 'transform 0.08s ease-out',
    })

    if (enableGlare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.18,
      })
    }
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.5s ease-out',
    })
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative overflow-hidden rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 shadow-xl transition-all duration-300 ${glowStyles[glowColor]} ${className}`}
      {...props}
    >
      {/* Specular Radial Glare Reflection */}
      {enableGlare && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 will-change-[opacity]"
          style={{
            background: `radial-gradient(circle 260px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 80%)`,
          }}
        />
      )}

      {/* Top subtle light rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default Card3D
