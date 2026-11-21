import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  CreditCard,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  AlertCircle,
  Building2,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AmbientBackground } from '@/components/common/AmbientBackground'

interface DemoPersona {
  id: string
  label: string
  role: 'admin' | 'staff'
  email: string
  badge: string
  icon: React.ReactNode
  isMobile?: boolean
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'admin',
    label: 'Admin Portal',
    role: 'admin',
    email: 'admin@loanflow.demo',
    badge: 'Executive',
    icon: <ShieldCheck className="h-4 w-4 text-blue-400" />,
  },
  {
    id: 'mobile-admin',
    label: 'Mobile Admin',
    role: 'admin',
    email: 'admin@loanflow.demo',
    badge: 'Mobile App',
    icon: <Smartphone className="h-4 w-4 text-purple-400" />,
    isMobile: true,
  },
  {
    id: 'staff-1',
    label: 'Staff Agent 1',
    role: 'staff',
    email: 'staff1@loanflow.demo',
    badge: '100 Calls/Day',
    icon: <PhoneCall className="h-4 w-4 text-emerald-400" />,
  },
  {
    id: 'staff-2',
    label: 'Staff Agent 2',
    role: 'staff',
    email: 'staff2@loanflow.demo',
    badge: 'Top Performer',
    icon: <TrendingUp className="h-4 w-4 text-amber-400" />,
  },
]

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@loanflow.demo')
  const [password, setPassword] = useState('Password123!')
  const [selectedPersona, setSelectedPersona] = useState<string>('admin')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
      .fromTo(
        cardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9 },
        '-=0.5'
      )
      .fromTo(
        dockRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        tickerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        '-=0.3'
      )

    return () => {
      tl.kill()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both email and password.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await login({ email, password })

      // If mobile persona selected, redirect to mobile admin
      if (selectedPersona === 'mobile-admin') {
        navigate('/admin-mobile')
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || 'Invalid email or password. Please verify credentials.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPersona = (persona: DemoPersona) => {
    setSelectedPersona(persona.id)
    setEmail(persona.email)
    setPassword('Password123!')
    setError(null)

    // Button micro-interaction with GSAP
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.995 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      )
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Dynamic Luminous Ambient Background with Floating GSAP Orbs */}
      <AmbientBackground showGrid={true} />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Top Header / Branding */}
        <div ref={headerRef} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-400" />
            <span>Enterprise Lending Infrastructure v2.4</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/25">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LoanFlow CRM
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            High-velocity financial intermediary platform connecting 20-agent call centres with institutional lending partners.
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div
          ref={cardRef}
          className="relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-slate-700/80 shadow-[0_0_60px_-15px_rgba(37,99,235,0.25)] p-6 sm:p-8 space-y-6"
        >
          {/* Quick Persona Selector Dock */}
          <div ref={dockRef} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>One-Click Role Demonstration</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                <Zap className="h-3 w-3" /> Auto-Fill Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200 text-xs ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">{p.icon}</div>
                    <div className="truncate">
                      <div className="font-semibold truncate">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{p.badge}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@loanflow.demo"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-blue-400 font-mono">Default: Password123!</span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>
                    Sign In to {selectedPersona === 'mobile-admin' ? 'Mobile Admin' : selectedPersona === 'admin' ? 'Admin Portal' : 'Call Centre Portal'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Under-Card Feature Badges */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Real-time PostgreSQL Backend
            </span>
            <span className="font-mono text-slate-500">JWT • RBAC • Supabase</span>
          </div>
        </div>

        {/* Live System Telemetry Ticker */}
        <div
          ref={tickerRef}
          className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800/80 p-3 text-center text-xs text-slate-400 space-y-1"
        >
          <div className="grid grid-cols-3 gap-2 divide-x divide-slate-800 text-[11px]">
            <div>
              <div className="text-white font-bold font-mono">100 Calls/Day</div>
              <div className="text-slate-500 text-[10px]">Per-Agent Goal</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold font-mono">₹48.2 Cr+</div>
              <div className="text-slate-500 text-[10px]">Monthly Submissions</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold font-mono">5 Banks</div>
              <div className="text-slate-500 text-[10px]">Integrated Schemes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
