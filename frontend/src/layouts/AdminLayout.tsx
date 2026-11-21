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
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Leads', path: '/admin/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Employees', path: '/admin/employees', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'Lead Distribution', path: '/admin/distribution', icon: <Share2 className="h-5 w-5" /> },
  { label: 'Call Records', path: '/admin/calls', icon: <PhoneCall className="h-5 w-5" /> },
  { label: 'Follow-ups', path: '/admin/followups', icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'Documents', path: '/admin/documents', icon: <FileCheck2 className="h-5 w-5" /> },
  { label: 'Banks', path: '/admin/banks', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Loan Schemes', path: '/admin/schemes', icon: <BadgePercent className="h-5 w-5" /> },
  { label: 'Applications', path: '/admin/applications', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> },
]

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">LoanFlow</h1>
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Enterprise CRM</span>
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Mobile View Switcher Shortcut */}
        <div className="p-3 border-t border-slate-800">
          <Link
            to="/admin-mobile"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition-colors border border-blue-900/40"
          >
            <Smartphone className="h-4 w-4" />
            <span>Switch to Mobile Admin</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-xs font-bold border border-slate-700">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role} Portal</p>
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
              <span className="font-semibold text-slate-900">Admin Workspace</span>
              <span className="text-slate-400">/</span>
              <span className="capitalize">
                {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin-mobile"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Portal</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Administrator
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-64 h-full bg-slate-900 p-4 flex flex-col text-slate-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                <span className="font-bold text-white">LoanFlow Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
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
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="pt-3 border-t border-slate-800">
                <Link
                  to="/admin-mobile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-blue-400 py-2"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Open Dedicated Mobile Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  )
}
