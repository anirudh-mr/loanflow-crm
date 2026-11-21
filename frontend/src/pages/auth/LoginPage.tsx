import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  AlertCircle,
  TrendingUp,
  Smartphone,
  Zap,
  Landmark,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Clock,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AmbientBackground } from '@/components/common/AmbientBackground'
import { Card3D } from '@/components/common/Card3D'
import { PartnerBanksShowcase } from '@/components/common/PartnerBanksShowcase'

interface DemoPersona {
  id: string
  label: string
  role: 'admin' | 'staff'
  email: string
  badge: string
  icon: React.ReactNode
  isMobile?: boolean
  description: string
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'admin',
    label: 'Admin Portal',
    role: 'admin',
    email: 'admin@loanflow.demo',
    badge: 'Executive Overseer',
    icon: <ShieldCheck className="h-5 w-5" />,
    description: 'Full system oversight, bank schemes, live analytics & targets',
  },
  {
    id: 'mobile-admin',
    label: 'Mobile Admin',
    role: 'admin',
    email: 'admin@loanflow.demo',
    badge: 'Executive App',
    icon: <Smartphone className="h-5 w-5" />,
    isMobile: true,
    description: 'On-the-go supervisor cockpit for tablet and smartphone',
  },
  {
    id: 'staff-1',
    label: 'Staff Agent 1',
    role: 'staff',
    email: 'staff1@loanflow.demo',
    badge: '100 Calls/Day',
    icon: <PhoneCall className="h-5 w-5" />,
    description: 'High-volume outbound calling, lead qualification & followups',
  },
  {
    id: 'staff-2',
    label: 'Staff Agent 2',
    role: 'staff',
    email: 'staff2@loanflow.demo',
    badge: 'Top Performer',
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Document verification, KYC checks & direct loan underwriting',
  },
]

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@loanflow.demo')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
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
      { opacity: 1, x: 0, duration: 0.8 }
    ).fromTo(
      cardRef.current,
      { opacity: 0, x: 30, scale: 0.98 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8 },
      '-=0.5'
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
        { scale: 1, duration: 0.25, ease: 'back.out(2)' }
      )
    }
  }

  return (
    <div className="relative min-h-screen bg-[#090e1a] text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-12 font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-white">
      {/* 3D Banking Ambient Canvas Background (Realistic Cards, Bullion, Vault Gear) */}
      <AmbientBackground theme="dark" showGrid={true} />

      {/* Top Institutional Trust Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pb-5 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center shadow-md">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold tracking-tight text-white text-base">LoanFlow CRM</span>
            <span className="hidden sm:inline-block ml-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300">
              ISO-20022 Intermediary Gateway
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[11px] font-mono text-slate-400">
          <span className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
            256-Bit Bank Encryption
          </span>
          <span className="hidden lg:flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            SOC-2 Type II Certified
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/90 text-emerald-300 font-semibold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            8 Bank APIs Live
          </span>
        </div>
      </header>

      {/* Main Dual-Column Hero & Login Experience */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Visual Brand, Telemetry Cards, and Partner Bank Showcase */}
        <div ref={heroRef} className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-mono font-medium shadow-xs">
            <Landmark className="h-3.5 w-3.5 text-amber-400" />
            <span>ENTERPRISE LOAN SALES CRM • INSTITUTIONAL PORTAL</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Enterprise Lending CRM & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-amber-200">
                Direct Bank Intermediary
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Connecting 20-agent outbound tele-calling desks directly with tier-1 partner banks.
              Instant customer credit underwriting, automated KYC docket generation, and real-time loan sanction routing.
            </p>
          </div>

          {/* Underwriting Telemetry Grid (Clean, Balanced & Modern) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-md">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sanction Volume</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">₹128.4 Cr</div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ 18.2% this quarter</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-md">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Daily Agent Target</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">100 Calls</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Per-rep quota tracker</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-md">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Underwriting</div>
              <div className="text-xl font-black text-amber-300 font-mono mt-0.5">&lt; 0.4s Route</div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Direct ISO-20022</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-md">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Approval Rate</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">88.4%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across 8 Banks</div>
            </div>
          </div>

          {/* Connected Partner Banking Grid Showcase */}
          <PartnerBanksShowcase variant="compact-dock" theme="dark" />
        </div>

        {/* Right Column: Expanded High-End Dark Banking Auth Vault Card */}
        <div ref={cardRef} className="lg:col-span-6 w-full max-w-xl mx-auto">
          <Card3D variant="obsidian" className="p-8 sm:p-10 space-y-7">
            {/* Header Title inside Vault */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Institutional Access Portal
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Select a pre-configured role or enter credentials
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                <Zap className="h-3 w-3" /> 1-Click Ready
              </span>
            </div>

            {/* Persona Quick Dock - Generous, Comfortable Sizing */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Simulation Roles
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_PERSONAS.map((p) => {
                  const isSelected = selectedPersona === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-slate-800 text-white border-amber-400/90 shadow-lg ring-1 ring-amber-400/30'
                          : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {p.icon}
                      </div>
                      <div className="truncate flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white truncate">{p.label}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-tight">
                          {p.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Corporate Email ID
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@loanflow.demo"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Session Password
                  </label>
                  <span className="text-[11px] text-amber-300/80 font-mono">Default: Password123!</span>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white p-1 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:from-slate-100 hover:to-white active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2.5">
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Session...</span>
                  </div>
                ) : (
                  <>
                    <span>
                      Launch{' '}
                      {selectedPersona === 'mobile-admin'
                        ? 'Mobile Admin'
                        : selectedPersona === 'admin'
                        ? 'Admin Suite'
                        : 'Call Centre Portal'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Telemetry Badge */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">Supabase PostgreSQL 15+</span>
              </span>
              <span className="font-mono text-slate-500">JWT • RBAC • Render API</span>
            </div>
          </Card3D>
        </div>
      </main>

      {/* Bottom Full-Width Partner Banks Marquee Ticker */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-4 border-t border-slate-800/80">
        <PartnerBanksShowcase variant="ticker" theme="dark" />
      </footer>
    </div>
  )
}

export default LoginPage
