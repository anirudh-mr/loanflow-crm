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
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface MobileNavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const allAdminModules: MobileNavItem[] = [
  { label: 'Dashboard', path: '/admin-mobile', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Leads', path: '/admin-mobile/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Employees', path: '/admin-mobile/employees', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'Distribution', path: '/admin-mobile/distribution', icon: <Share2 className="h-5 w-5" /> },
  { label: 'Call Records', path: '/admin-mobile/calls', icon: <PhoneCall className="h-5 w-5" /> },
  { label: 'Follow-ups', path: '/admin-mobile/followups', icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'Documents', path: '/admin-mobile/documents', icon: <FileCheck2 className="h-5 w-5" /> },
  { label: 'Banks', path: '/admin-mobile/banks', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Schemes', path: '/admin-mobile/schemes', icon: <BadgePercent className="h-5 w-5" /> },
  { label: 'Applications', path: '/admin-mobile/applications', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { label: 'Reports', path: '/admin-mobile/reports', icon: <BarChart3 className="h-5 w-5" /> },
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans max-w-full overflow-x-hidden pb-16">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight leading-none block">LoanFlow</span>
              <span className="text-[9px] text-blue-400 font-medium uppercase tracking-wider block">
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
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-900">{currentTitle}</h1>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Admin
        </span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">{children}</main>

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shadow-lg">
        {bottomNavItems.map((item) => {
          const isActive =
            item.path === '/admin-mobile'
              ? location.pathname === '/admin-mobile'
              : location.pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>{item.icon}</div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}

        {/* More Button to trigger Slide-out Drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900"
        >
          <div className="p-1">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* Slide-out Full Drawer for All 11 Admin Modules */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-4/5 max-w-xs h-full bg-slate-900 p-5 flex flex-col text-slate-300 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">LoanFlow</span>
                  <span className="text-[10px] text-blue-400 block font-medium">All Modules</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* All 11 Admin Modules in Drawer */}
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <Link
                to="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 py-1.5"
              >
                <Monitor className="h-4 w-4" />
                <span>Switch to Desktop View</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-rose-400 hover:text-rose-300 py-1.5 w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user?.full_name?.split(' ')[0]})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
