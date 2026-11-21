import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Landmark,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { RoleTabs, RoleConfig } from '@/components/auth/RoleTabs'
import { StaticGradientMesh } from '@/components/auth/StaticGradientMesh'
import { BankLogo } from '@/components/common/BankLogo'

// Lazy-load R3F 3D background with light studio aesthetic
const Background3D = React.lazy(() => import('@/components/auth/Background3D'))

const PARTNER_BANK_KEYS = ['hdfc', 'sbi', 'icici', 'axis', 'kotak', 'bob', 'pnb', 'idfc']

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [email, setEmail] = useState('admin@loanflow.demo')
  const [password, setPassword] = useState('')
  const [selectedPersona, setSelectedPersona] = useState<string>('admin')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  // Tilt & Specular state
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 })
  const [specular, setSpecular] = useState({ x: 50, y: 50, opacity: 0 })
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Cursor radial glow behind card
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false })

  // Magnetic button state
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 })

  // Demo note visibility
  const isDemoEnv = (import.meta as any).env?.VITE_DEMO_MODE !== 'false'
  const [showDemoNote, setShowDemoNote] = useState<boolean>(isDemoEnv)

  // Set default demo password on mount for frictionless evaluation
  useEffect(() => {
    if (isDemoEnv) {
      setPassword('Password123!')
    }
  }, [isDemoEnv])

  // Track cursor for ambient radial blue glow
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY, visible: true })

    // 3D Card Tilt (only if input is not focused)
    if (cardRef.current && !isInputFocused) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -3.5
        const rotateY = ((x - centerX) / centerX) * 3.5

        setCardTilt({ x: rotateX, y: rotateY })
        setSpecular({
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100,
          opacity: 0.12,
        })
      } else {
        setCardTilt({ x: 0, y: 0 })
        setSpecular((prev) => ({ ...prev, opacity: 0 }))
      }
    }
  }

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 })
    setSpecular((prev) => ({ ...prev, opacity: 0 }))
  }

  // Magnetic Pull Effect on Sign In button (pulls up to 8px toward cursor)
  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Clamp to max 8px in each direction
    const pullX = Math.max(-8, Math.min(8, x * 0.18))
    const pullY = Math.max(-8, Math.min(8, y * 0.22))
    setButtonOffset({ x: pullX, y: pullY })
  }

  const handleButtonMouseLeave = () => {
    setButtonOffset({ x: 0, y: 0 })
  }

  const handleRoleChange = (role: RoleConfig) => {
    setSelectedPersona(role.id)
    setEmail(role.email)
    if (isDemoEnv) {
      setPassword('Password123!')
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both your corporate email and password.')
      triggerShake()
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await login({ email, password })

      // Trigger smooth success sequence
      setIsSuccess(true)
      setTimeout(() => {
        if (selectedPersona === 'mobile-admin') {
          navigate('/admin-mobile')
        } else if (selectedPersona === 'agent' || selectedPersona === 'kyc-agent') {
          navigate('/staff')
        } else {
          navigate('/admin')
        }
      }, 450)
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || 'Invalid email or password. Please verify credentials.'
      setError(msg)
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 450)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-[#F1F3F7] to-[#E8ECF4] text-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased overflow-x-hidden selection:bg-[#2563EB]/20 selection:text-[#0F172A]"
    >
      {/* 3D R3F Studio Background (Lazy-loaded with static gradient fallback) */}
      <Suspense fallback={<StaticGradientMesh />}>
        <Background3D loginSuccess={isSuccess} />
      </Suspense>

      {/* Cursor-following Soft Radial Blue Glow Behind Card */}
      {cursorPos.visible && (
        <div
          className="pointer-events-none fixed -inset-px transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(circle 420px at ${cursorPos.x}px ${cursorPos.y}px, rgba(37, 99, 235, 0.08), transparent 75%)`,
          }}
        />
      )}

      {/* Main Centered Composition */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center my-auto">
        {/* Brand Header: Dark Navy Logo Mark (Matches Sidebar) + Wordmark */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-2.5">
            {/* Logo Mark: Dark Navy Rounded Square with Bank Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-xs transition-transform duration-300 hover:scale-105">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
              LoanFlow
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A]">
            Welcome back
          </h1>
          <p className="text-sm text-[#64748B] font-normal mt-1">
            Sign in to your lending workspace
          </p>
        </div>

        {/* Hero Login Card */}
        <div
          ref={cardRef}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: isInputFocused
              ? 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)'
              : isSuccess
              ? 'perspective(1200px) scale(1.02)'
              : `perspective(1200px) rotateX(${cardTilt.x.toFixed(2)}deg) rotateY(${cardTilt.y.toFixed(2)}deg)`,
            transition: isInputFocused || cardTilt.x === 0 ? 'transform 0.4s ease-out' : 'transform 0.08s ease-out',
          }}
          className={`relative w-full rounded-[24px] p-6 sm:p-8 bg-white/85 backdrop-blur-xl border border-slate-900/[0.08] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] space-y-6 ${
            isShaking ? 'animate-shake' : 'animate-card-entrance'
          }`}
        >
          {/* Specular Glare Overlay */}
          <div
            className="pointer-events-none absolute -inset-px rounded-[24px] transition-opacity duration-300 will-change-[opacity]"
            style={{
              background: `radial-gradient(circle 280px at ${specular.x}% ${specular.y}%, rgba(255, 255, 255, ${specular.opacity}), transparent 75%)`,
            }}
          />

          {/* Role Selector Segmented Control on Top */}
          <RoleTabs
            selectedRole={selectedPersona}
            onSelectRole={handleRoleChange}
          />

          {/* Dismissible Demo Mode Access Hint */}
          {showDemoNote && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1D4ED8]">
              <div className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                <span className="truncate">
                  Demo credentials ready. Click any role above to switch.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoNote(false)}
                className="text-[#1D4ED8]/70 hover:text-[#1D4ED8] shrink-0 p-0.5 rounded transition-colors"
                aria-label="Dismiss demo note"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Inline Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Work Email Input */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="corporate-email"
                className="block text-xs font-semibold text-[#0F172A] tracking-tight"
              >
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="corporate-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="name@company.com"
                  className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="account-password"
                  className="block text-xs font-semibold text-[#0F172A] tracking-tight"
                >
                  Password
                </label>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault()
                    setError('Contact your system administrator to reset credentials.')
                  }}
                  className="text-xs text-[#2563EB] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="account-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="••••••••••••"
                  className="w-full h-[52px] pl-10 pr-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#64748B]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#0F172A] focus:ring-[#2563EB]/30 transition-all cursor-pointer accent-[#0F172A]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Primary Action Button with Magnetic Hover Effect */}
            <div className="pt-2">
              <button
                ref={buttonRef}
                type="submit"
                disabled={isLoading}
                onMouseMove={handleButtonMouseMove}
                onMouseLeave={handleButtonMouseLeave}
                style={{
                  transform: `translate3d(${buttonOffset.x}px, ${buttonOffset.y}px, 0)`,
                  transition: buttonOffset.x === 0 ? 'transform 0.3s ease-out, box-shadow 0.2s' : 'box-shadow 0.2s',
                }}
                className="group relative w-full h-[52px] rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm tracking-tight flex items-center justify-center gap-2 shadow-xs hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed select-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Partner Banks Footer */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          {/* Security Badge */}
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured with 256-bit encryption</span>
          </div>

          {/* Trusted by 8 Partner Banks */}
          <div className="flex flex-col items-center space-y-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
              Trusted by 8 partner banks
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-[420px]">
              {PARTNER_BANK_KEYS.map((key) => (
                <div
                  key={key}
                  className="filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110 cursor-pointer"
                  title={key.toUpperCase()}
                >
                  <BankLogo bank={key} variant="icon" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
