import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  CalendarClock,
  FileCheck2,
  FileSpreadsheet,
  Award,
  LogOut,
  Menu,
  X,
  CreditCard,
  Target,
  Flame,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/api'
import { CallProgress } from '@/types'
import { AmbientBackground } from '@/components/common/AmbientBackground'

const staffNavItems = [
  { label: 'Dashboard', path: '/staff', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Leads', path: '/staff/leads', icon: <Users className="h-4 w-4" /> },
  { label: 'Call Records', path: '/staff/calls', icon: <PhoneCall className="h-4 w-4" /> },
  { label: 'Follow-ups', path: '/staff/followups', icon: <CalendarClock className="h-4 w-4" /> },
  { label: 'KYC Documents', path: '/staff/documents', icon: <FileCheck2 className="h-4 w-4" /> },
  { label: 'Loan Tracking', path: '/staff/loans', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { label: 'My Performance', path: '/staff/performance', icon: <Award className="h-4 w-4" /> },
]

export const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Query real-time daily 100-call progress
  const { data: progress } = useQuery<CallProgress>({
    queryKey: ['staffCallProgress'],
    queryFn: () => apiClient.get<CallProgress>('/calls/progress'),
    refetchInterval: 15000,
  })

  const completed = progress?.completed || 0
  const target = progress?.target || 100
  const pct = Math.min(progress?.percentage || 0, 100)

  return (
    <div className="relative flex h-screen bg-slate-950 font-sans overflow-hidden text-slate-100">
      {/* Ambient Atmospheric Luminous Glow */}
      <AmbientBackground showGrid={true} />

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden lg:flex flex-col w-64 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 text-slate-300 select-none shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-950/40">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 ring-1 ring-white/10">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">LoanFlow</h1>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              Call Centre Portal
            </span>
          </div>
        </div>

        {/* 100-Call Daily Target Indicator in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-400" />
              100-Call Shift Goal
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              {completed}/{target}
            </span>
          </div>
          <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-emerald-400/50"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-400" />
              {progress?.remaining || 100} calls remaining
            </span>
            <span className="font-bold text-emerald-400 font-mono">{pct}%</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {staffNavItems.map((item) => {
            const isActive =
              item.path === '/staff'
                ? location.pathname === '/staff'
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-emerald-400 font-mono">Agent Shift Active</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-white">Call Centre Shift</span>
              <span className="text-slate-600">/</span>
              <span className="capitalize font-semibold text-emerald-400">
                {location.pathname.replace('/staff', '').replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick target pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-300">
              <Target className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>
                Shift Goal: <strong className="text-white font-mono">{completed}/{target}</strong> calls
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md">
            <div className="w-64 h-full bg-slate-900 p-4 flex flex-col text-slate-300 border-r border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                <span className="font-bold text-white">Call Centre Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {staffNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
