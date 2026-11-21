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
  LogOut,
  Menu,
  X,
  CreditCard,
  Monitor,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AmbientBackground } from '@/components/common/AmbientBackground'

interface MobileNavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const allAdminModules: MobileNavItem[] = [
  { label: 'Dashboard', path: '/admin-mobile', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Leads CRM', path: '/admin-mobile/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Employees', path: '/admin-mobile/employees', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'Distribution', path: '/admin-mobile/distribution', icon: <Share2 className="h-5 w-5" /> },
  { label: 'Call Records', path: '/admin-mobile/calls', icon: <PhoneCall className="h-5 w-5" /> },
  { label: 'Follow-ups', path: '/admin-mobile/followups', icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'KYC Documents', path: '/admin-mobile/documents', icon: <FileCheck2 className="h-5 w-5" /> },
  { label: 'Partner Banks', path: '/admin-mobile/banks', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Loan Schemes', path: '/admin-mobile/schemes', icon: <BadgePercent className="h-5 w-5" /> },
  { label: 'Applications', path: '/admin-mobile/applications', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { label: 'Reports & BI', path: '/admin-mobile/reports', icon: <BarChart3 className="h-5 w-5" /> },
]

// Bottom bar top 4 quick destinations
const bottomNavItems = [
  { label: 'Home', path: '/admin-mobile', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Leads', path: '/admin-mobile/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Calls', path: '/admin-mobile/calls', icon: <PhoneCall className="h-5 w-5" /> },
  { label: 'Followups', path: '/admin-mobile/followups', icon: <CalendarClock className="h-5 w-5" /> },
]

export const MobileAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Current module title
  const currentItem = allAdminModules.find((item) =>
    item.path === '/admin-mobile'
      ? location.pathname === '/admin-mobile'
      : location.pathname.startsWith(item.path)
  )
  const currentTitle = currentItem?.label || 'Admin Portal'

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-950 font-sans max-w-full overflow-x-hidden pb-20 text-slate-100">
      {/* Ambient Animated Atmospheric Glow */}
      <AmbientBackground showGrid={true} />

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight leading-none block">LoanFlow</span>
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                Mobile Admin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to Desktop Web Portal */}
          <Link
            to="/admin"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg active:bg-slate-800"
            title="Switch to Desktop Admin"
          >
            <Monitor className="h-5 w-5" />
          </Link>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg active:bg-slate-800"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sub-header with page title and breadcrumb */}
      <div className="sticky top-14 z-20 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-bold text-white">{currentTitle}</h1>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
          Executive Role
        </span>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-3.5 sm:p-4 overflow-y-auto">{children}</main>

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800/80 flex items-center justify-around px-2 shadow-2xl">
        {bottomNavItems.map((item) => {
          const isActive =
            item.path === '/admin-mobile'
              ? location.pathname === '/admin-mobile'
              : location.pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/40' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}

        {/* More Button to trigger Slide-out Drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200"
        >
          <div className="p-1.5">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="mt-0.5">Modules</span>
        </button>
      </nav>

      {/* Slide-out Full Drawer for All 11 Admin Modules */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md">
          <div className="w-4/5 max-w-xs h-full bg-slate-900 p-5 flex flex-col text-slate-300 shadow-2xl border-r border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  LF
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-none">LoanFlow CRM</h2>
                  <span className="text-[10px] text-blue-400 font-mono">11 Admin Modules</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg active:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modules List */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {allAdminModules.map((item) => {
                const isActive =
                  item.path === '/admin-mobile'
                    ? location.pathname === '/admin-mobile'
                    : location.pathname.startsWith(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link
                to="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
              >
                <Monitor className="h-4 w-4 text-blue-400" />
                <span>Switch to Desktop Admin</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold rounded-xl border border-rose-900/40"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileAdminLayout
