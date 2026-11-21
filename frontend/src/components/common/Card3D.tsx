import React, { useRef, useState } from 'react'

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  variant?: 'light' | 'mist' | 'dark' | 'obsidian'
  maxTilt?: number
  enableGlare?: boolean
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  variant = 'mist',
  maxTilt = 4,
  enableGlare = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })

  const isDark = variant === 'dark' || variant === 'obsidian'

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
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(3px)`,
      transition: 'transform 0.08s ease-out',
    })

    if (enableGlare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: isDark ? 0.08 : 0.12,
      })
    }
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.4s ease-out',
    })
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  // Refined Institutional Mist Blue / Alabaster Light Theme default
  const baseStyle = isDark
    ? 'bg-[#0b1120]/95 backdrop-blur-2xl border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(11,17,32,0.45)] hover:border-slate-600 text-white'
    : 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] hover:border-slate-300 text-slate-900'

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${baseStyle} ${className}`}
      {...props}
    >
      {/* Specular Glare Sheen */}
      {enableGlare && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 will-change-[opacity]"
          style={{
            background: isDark
              ? `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 80%)`
              : `radial-gradient(circle 240px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 75%)`,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default Card3D
