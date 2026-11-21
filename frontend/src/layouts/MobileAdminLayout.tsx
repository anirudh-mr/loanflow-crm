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
  Landmark,
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

  const currentItem = allAdminModules.find((item) =>
    item.path === '/admin-mobile'
      ? location.pathname === '/admin-mobile'
      : location.pathname.startsWith(item.path)
  )
  const currentTitle = currentItem?.label || 'Admin Portal'

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fafc] font-sans max-w-full overflow-x-hidden pb-20 text-slate-800">
      {/* 3D Banking Ambient Background */}
      <AmbientBackground showGrid={true} />

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 text-slate-800 flex items-center justify-between px-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg active:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight leading-none block text-slate-900">LoanFlow</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                Mobile Admin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg active:bg-slate-100"
            title="Switch to Desktop Admin"
          >
            <Monitor className="h-5 w-5" />
          </Link>

          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg active:bg-slate-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sub-header */}
      <div className="sticky top-14 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/90 px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-900">{currentTitle}</h1>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Executive Role
        </span>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-3.5 sm:p-4 overflow-y-auto">{children}</main>

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 flex items-center justify-around px-2 shadow-lg">
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
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-slate-500 text-[10px] font-semibold"
        >
          <div className="p-1.5 rounded-xl">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* Side Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs h-full bg-white text-slate-800 flex flex-col p-4 shadow-2xl border-l border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">All Modules</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1">
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
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setDrawerOpen(false)
                  logout()
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileAdminLayout
