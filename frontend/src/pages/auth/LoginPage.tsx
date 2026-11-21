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
  Activity,
  Layers,
  Database,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AmbientBackground } from '@/components/common/AmbientBackground'
import { Card3D } from '@/components/common/Card3D'
import { FintechOrbital3D } from '@/components/common/FintechOrbital3D'

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
    icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />,
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
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(
      heroRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.9 }
    ).fromTo(
      cardRef.current,
      { opacity: 0, x: 30, scale: 0.97 },
      { opacity: 1, x: 0, scale: 1, duration: 0.9 },
      '-=0.6'
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

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.995 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      )
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-12 font-sans overflow-hidden">
      {/* 3D WebGL Live Universe Background */}
      <AmbientBackground showGrid={true} />

      {/* Main Dual-Column Hero & Login Experience */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Visual Brand & Interactive 3D Quantum Loan Core */}
        <div ref={heroRef} className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
            <span>ENTERPRISE LENDING CRM • PRODUCTION SUITE</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-xl shadow-cyan-500/25">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              LoanFlow CRM
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Next-generation lending operations hub connecting 20-agent outbound call centres with institutional banking partners, KYC verification, and live PostgreSQL telemetry.
          </p>

          {/* Interactive 3D Quantum Core Widget */}
          <div className="flex justify-center lg:justify-start py-2">
            <FintechOrbital3D
              size={240}
              stats={{
                approvedRate: 88.4,
                activeLeads: 1250,
                processingSpeed: '0.4s',
              }}
            />
          </div>

          {/* Live System Telemetry Ticker */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-4 shadow-xl">
            <div className="grid grid-cols-3 gap-3 divide-x divide-slate-800 text-[11px]">
              <div className="text-center">
                <div className="text-white font-extrabold font-mono text-sm">100 Calls/Day</div>
                <div className="text-slate-400 text-[10px]">Daily Rep Target</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 font-extrabold font-mono text-sm">Real-Time</div>
                <div className="text-slate-400 text-[10px]">Supabase PostgreSQL</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-extrabold font-mono text-sm">5 Banks</div>
                <div className="text-slate-400 text-[10px]">Automated Routing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Frosted Glass Auth Vault */}
        <div ref={cardRef} className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card3D glowColor="cyan" className="p-6 sm:p-8 space-y-6">
            {/* Persona Quick Dock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                <span>1-Click Persona Simulator</span>
                <span className="text-cyan-400 flex items-center gap-1 font-mono text-[10px]">
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
                          ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                          : 'bg-slate-850 hover:bg-slate-800/80 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900 shrink-0">{p.icon}</div>
                      <div className="truncate">
                        <div className="font-semibold truncate">{p.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{p.badge}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@loanflow.demo"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Default: Password123!</span>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-95 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                    <span>Authorizing Session...</span>
                  </div>
                ) : (
                  <>
                    <span>
                      Launch {selectedPersona === 'mobile-admin' ? 'Mobile Admin' : selectedPersona === 'admin' ? 'Admin Suite' : 'Call Centre Portal'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Telemetry Badge */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Supabase PostgreSQL 15+
              </span>
              <span className="font-mono text-slate-500">JWT • RBAC • Render</span>
            </div>
          </Card3D>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
