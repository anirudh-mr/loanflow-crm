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
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/api'
import { CallProgress } from '@/types'

const staffNavItems = [
  { label: 'Dashboard', path: '/staff', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Leads', path: '/staff/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Call Records', path: '/staff/calls', icon: <PhoneCall className="h-5 w-5" /> },
  { label: 'Follow-ups', path: '/staff/followups', icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'Documents', path: '/staff/documents', icon: <FileCheck2 className="h-5 w-5" /> },
  { label: 'Loan Tracking', path: '/staff/loans', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { label: 'My Performance', path: '/staff/performance', icon: <Award className="h-5 w-5" /> },
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">LoanFlow</h1>
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
              Call Centre Portal
            </span>
          </div>
        </div>

        {/* 100-Call Daily Target Indicator in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-400" />
              Daily Call Goal
            </span>
            <span className="text-emerald-400 font-bold">
              {progress ? `${progress.completed}/${progress.target}` : '0/100'}
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress?.percentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
            <span>{progress ? `${progress.remaining} calls remaining` : '100 calls left'}</span>
            <span className="font-medium text-slate-300">
              {progress ? `${progress.percentage}%` : '0%'}
            </span>
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-800">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-emerald-400">Sales Executive</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Call Centre Workspace</span>
              <span className="text-slate-400">/</span>
              <span className="capitalize">
                {location.pathname.replace('/staff', '').replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick target pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
              <Target className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                Calls Today:{' '}
                <strong>{progress ? `${progress.completed}/${progress.target}` : '0/100'}</strong>
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-64 h-full bg-slate-900 p-4 flex flex-col text-slate-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                <span className="font-bold text-white">Staff Navigation</span>
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
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  )
}
