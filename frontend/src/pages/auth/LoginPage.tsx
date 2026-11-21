import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Mail, ArrowRight, ShieldCheck, PhoneCall, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please verify credentials.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (userEmail: string, isMobileAdmin = false) => {
    setEmail(userEmail)
    setPassword('Password123!')
    setError(null)
    if (isMobileAdmin) {
      // Set destination hint
      window.history.replaceState(null, '', '/admin-mobile')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25 mb-4">
          <CreditCard className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">LoanFlow CRM</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enterprise Loan Sales & Call Centre CRM Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@loanflow.demo"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Evaluation Demo Accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@loanflow.demo')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-medium transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Admin Web</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff1@loanflow.demo')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 font-medium transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-emerald-600" />
                <span>Staff Portal</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fillCredentials('admin@loanflow.demo', true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-dashed border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-medium text-xs transition-colors"
            >
              <span>Explore Mobile Admin (/admin-mobile)</span>
            </button>
          </div>
        </div>

        {/* System Capabilities Footer */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-800">100 Calls/Day</span>
            <span>Target Tracker</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-800">RBAC Security</span>
            <span>JWT & Audit Logs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-800">5 Partner Banks</span>
            <span>Scheme Catalog</span>
          </div>
        </div>
      </div>
    </div>
  )
}
