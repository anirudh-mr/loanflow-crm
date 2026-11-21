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
  Landmark,
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
    <div className="relative flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-slate-800">
      {/* 3D Banking Ambient Background */}
      <AmbientBackground showGrid={true} theme="light" />

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden lg:flex flex-col w-64 bg-white/95 backdrop-blur-2xl border-r border-slate-200/90 text-slate-700 select-none shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200/90 bg-white/70">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Landmark className="h-4 w-4 text-slate-100" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">LoanFlow</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Call Centre Rep
            </span>
          </div>
        </div>

        {/* 100-Call Daily Target Indicator in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-700" />
              100-Call Target
            </span>
            <span className="text-emerald-700 font-bold font-mono">
              {completed}/{target}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
            <span>{progress?.remaining || 100} calls to go</span>
            <span className="font-bold text-emerald-700">{pct}%</span>
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200/90 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900">Call Centre Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="capitalize font-semibold text-slate-700">
                {location.pathname.replace('/staff', '').replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Shift Pace: {pct}%</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs">
            <div className="w-64 h-full bg-white p-4 flex flex-col text-slate-700 border-r border-slate-200 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-3">
                <span className="font-bold text-slate-900">LoanFlow Staff</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
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
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
