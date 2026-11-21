import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Share2,
  PhoneCall,
  CalendarClock,
  FileCheck2,
  Building2,
  BadgePercent,
  FileSpreadsheet,
  BarChart3,
  Smartphone,
  LogOut,
  Menu,
  X,
  CreditCard,
  Database,
  Activity,
  Landmark,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AmbientBackground } from '@/components/common/AmbientBackground'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Leads CRM', path: '/admin/leads', icon: <Users className="h-4 w-4" /> },
  { label: 'Employees', path: '/admin/employees', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Distribution', path: '/admin/distribution', icon: <Share2 className="h-4 w-4" /> },
  { label: 'Call Records', path: '/admin/calls', icon: <PhoneCall className="h-4 w-4" /> },
  { label: 'Follow-ups', path: '/admin/followups', icon: <CalendarClock className="h-4 w-4" /> },
  { label: 'Documents', path: '/admin/documents', icon: <FileCheck2 className="h-4 w-4" /> },
  { label: 'Partner Banks', path: '/admin/banks', icon: <Building2 className="h-4 w-4" /> },
  { label: 'Loan Schemes', path: '/admin/schemes', icon: <BadgePercent className="h-4 w-4" /> },
  { label: 'Applications', path: '/admin/applications', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { label: 'Reports & BI', path: '/admin/reports', icon: <BarChart3 className="h-4 w-4" /> },
]

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-slate-800">
      {/* 3D Banking Ambient Canvas Background */}
      <AmbientBackground showGrid={true} theme="light" />

      {/* Desktop Sidebar (Clean Alabaster / White) */}
      <aside className="relative z-10 hidden lg:flex flex-col w-64 bg-white/95 backdrop-blur-2xl border-r border-slate-200/90 text-slate-700 select-none shadow-xs">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200/90 bg-white/70">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Landmark className="h-4 w-4 text-slate-100" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">LoanFlow</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Institutional Admin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
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

        {/* Mobile Portal Shortcut */}
        <div className="p-3 border-t border-slate-200/90">
          <Link
            to="/admin-mobile"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 bg-slate-50"
          >
            <Smartphone className="h-4 w-4 text-slate-500" />
            <span>Open Mobile Portal</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-slate-200/90 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.full_name?.charAt(0) || 'A'}
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

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900">Admin Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="capitalize font-semibold text-slate-700">
                {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live DB Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Real-Time Supabase Sync</span>
            </div>

            <Link
              to="/admin-mobile"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              <Smartphone className="h-3.5 w-3.5 text-slate-500" />
              <span>Mobile View</span>
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs">
            <div className="w-64 h-full bg-white p-4 flex flex-col text-slate-700 border-r border-slate-200 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-3">
                <span className="font-bold text-slate-900">LoanFlow Admin</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
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
              <div className="pt-3 border-t border-slate-200">
                <Link
                  to="/admin-mobile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-slate-700 py-2 font-semibold"
                >
                  <Smartphone className="h-4 w-4 text-slate-500" />
                  <span>Open Dedicated Mobile Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
