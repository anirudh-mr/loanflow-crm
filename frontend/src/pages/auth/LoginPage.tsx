import React, { useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { RoleTabs, ROLES, RoleConfig } from '@/components/auth/RoleTabs'
import { StaticGradientMesh } from '@/components/auth/StaticGradientMesh'
import { BankLogo } from '@/components/common/BankLogo'

// Lazy-load R3F 3D background to prevent blocking initial form render
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

  // Demo note visibility (visible by default, easily dismissible)
  const isDemoEnv = (import.meta as any).env?.VITE_DEMO_MODE !== 'false'
  const [showDemoNote, setShowDemoNote] = useState<boolean>(isDemoEnv)

  const handleRoleChange = (role: RoleConfig) => {
    setSelectedPersona(role.id)
    setEmail(role.email)
    // Pre-fill demo password for frictionless evaluation when in demo mode
    if (isDemoEnv) {
      setPassword('Password123!')
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both your corporate email and password.')
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

  return (
    <div className="relative min-h-screen bg-[#060B1A] text-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* 3D Subtle Background (Lazy-loaded with static gradient fallback) */}
      <Suspense fallback={<StaticGradientMesh />}>
        <Background3D />
      </Suspense>

      {/* Main Centered Container */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center my-auto">
        {/* Brand Header: Logo Mark + Wordmark */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            {/* Logo Mark: Indigo Crest with Tiny Gold Accent */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30">
              <div className="relative flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
                {/* Tiny Gold Accent Dot */}
                <span className="absolute w-2 h-2 rounded-full bg-[#F5C451] shadow-[0_0_6px_#F5C451] -top-0.5 -right-0.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">LoanFlow</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-[#94A3B8] font-normal mt-1">
            Sign in to your lending workspace
          </p>
        </div>

        {/* Hero Login Card with Gradient Glow Ring */}
        <div className="relative w-full">
          {/* Subtle Indigo-to-Cyan Ambient Glow Behind Card */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-25 blur-[80px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)',
            }}
          />

          {/* Glassmorphism Card Surface */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] shadow-[0_20px_50px_rgba(0,0,0,0.55)] animate-card-entrance space-y-6">
            {/* Role Selector Tabs on Top */}
            <RoleTabs
              selectedRole={selectedPersona}
              onSelectRole={handleRoleChange}
            />

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-[#F87171] flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171]" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Dismissible Demo Access Banner */}
            {showDemoNote && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-slate-300 flex items-center justify-between gap-2">
                <span className="truncate">
                  <strong className="text-indigo-300 font-medium">Demo access:</strong> Password is{' '}
                  <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">
                    Password123!
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoNote(false)}
                  aria-label="Dismiss demo notice"
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Corporate Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="work-email"
                  className="block text-xs font-medium text-[#94A3B8]"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="work-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full h-[52px] bg-white/[0.03] border border-white/[0.10] rounded-xl pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="work-password"
                    className="block text-xs font-medium text-[#94A3B8]"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('For assessment demo, use Password123! or select any role tab above.')
                    }}
                    className="text-xs text-[#818CF8] hover:text-[#22D3EE] transition-colors focus:outline-none focus:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="work-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-[52px] bg-white/[0.03] border border-white/[0.10] rounded-xl pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#94A3B8] hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6366F1] via-indigo-600 to-[#818CF8] hover:opacity-95 active:scale-[0.99] shadow-[0_4px_24px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Quiet Encryption Assurance */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>

        {/* Quiet Footer: Single row of grayscale bank logos */}
        <div className="flex flex-col items-center gap-2.5 pt-8 text-center">
          <span className="text-xs text-slate-500 font-normal">
            Trusted by 8 partner banks
          </span>
          <div className="flex items-center justify-center gap-4 sm:gap-5 opacity-40 hover:opacity-75 transition-opacity duration-300 grayscale">
            {PARTNER_BANK_KEYS.map((bankKey) => (
              <div
                key={bankKey}
                className="w-5 h-5 flex items-center justify-center"
                title={bankKey.toUpperCase()}
              >
                <BankLogo bank={bankKey} variant="icon" size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
