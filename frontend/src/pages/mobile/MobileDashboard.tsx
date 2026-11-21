import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  PhoneCall,
  UserCheck,
  Share2,
  CalendarClock,
  FileCheck2,
  Building2,
  BadgePercent,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Landmark,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { apiClient } from '@/services/api'
import { DashboardStats } from '@/types'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Card3D } from '@/components/common/Card3D'

export const MobileDashboard: React.FC = () => {
  const navigate = useNavigate()

  // 1. Fetch Real Admin Stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: () => apiClient.get<DashboardStats>('/analytics/dashboard'),
  })

  // 2. Fetch Daily Call Chart
  const { data: callChart } = useQuery<any[]>({
    queryKey: ['adminDailyCallsChartMobile'],
    queryFn: () => apiClient.get<any[]>('/analytics/daily-calls?days=7'),
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <LoadingSkeleton count={5} />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5 text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* Welcome Banner (Clean Light Mist Theme) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
              EXECUTIVE MOBILE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
          </div>

          <h1 className="text-xl font-extrabold mt-2 text-slate-900">
            Mobile Operations
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time oversight of customer leads, 20 call agents, and institutional banking pipeline.
          </p>

          {/* Action Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <Link
              to="/admin-mobile/distribution"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shrink-0 shadow-xs active:scale-95 transition-transform"
            >
              <Share2 className="h-3.5 w-3.5" />
              Distribute
            </Link>
            <Link
              to="/admin-mobile/leads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl shrink-0 border border-slate-200 active:scale-95 transition-transform"
            >
              <Users className="h-3.5 w-3.5 text-slate-600" />
              Leads CRM
            </Link>
            <Link
              to="/admin-mobile/documents"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl shrink-0 border border-slate-200 active:scale-95 transition-transform"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-slate-600" />
              Verify Docs
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Critical Attention Badges */}
      {/* ------------------------------------------------------------- */}
      {stats && (stats.unassigned_leads > 0 || stats.overdue_followups > 0) && (
        <div className="space-y-2">
          {stats.unassigned_leads > 0 && (
            <Link
              to="/admin-mobile/distribution"
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs active:bg-amber-100 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-mono">{stats.unassigned_leads} leads</strong> require agent allocation.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-600 shrink-0" />
            </Link>
          )}

          {stats.overdue_followups > 0 && (
            <Link
              to="/admin-mobile/followups"
              className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs active:bg-rose-100 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong className="font-mono">{stats.overdue_followups} follow-ups</strong> are overdue.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-600 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3D Touch-Reactive KPI Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/admin-mobile/leads" className="block">
          <Card3D className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leads</span>
              <Users className="h-4 w-4 text-blue-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {stats?.total_leads || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">+{stats?.leads_today || 0} today</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/calls" className="block">
          <Card3D className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calls Today</span>
              <PhoneCall className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {stats?.calls_today || 0}
            </div>
            <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">Goal: {stats?.daily_target || 2000}</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/applications" className="block">
          <Card3D className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="h-4 w-4 text-purple-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {stats?.approved_loans || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">{stats?.disbursed_loans || 0} disbursed</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/documents" className="block">
          <Card3D className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending KYC</span>
              <FileCheck2 className="h-4 w-4 text-amber-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {stats?.pending_documents || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Verification queue</div>
          </Card3D>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Calling Trends Area Chart (Light Mist Glass) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-blue-600" />
            7-Day Call Volume
          </span>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Live Stream
          </span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={callChart || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileCallsGradMist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '11px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} fill="url(#mobileCallsGradMist)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* All Administrative Modules Navigation Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider mb-3">
          All Management Modules
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/admin-mobile/leads"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <Users className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Leads CRM</span>
          </Link>
          <Link
            to="/admin-mobile/employees"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <UserCheck className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Employees</span>
          </Link>
          <Link
            to="/admin-mobile/distribution"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <Share2 className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Distribution</span>
          </Link>
          <Link
            to="/admin-mobile/calls"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <PhoneCall className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Calls</span>
          </Link>
          <Link
            to="/admin-mobile/followups"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <CalendarClock className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Follow-ups</span>
          </Link>
          <Link
            to="/admin-mobile/documents"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <FileCheck2 className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">KYC Docs</span>
          </Link>
          <Link
            to="/admin-mobile/banks"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <Building2 className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Partner Banks</span>
          </Link>
          <Link
            to="/admin-mobile/schemes"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <BadgePercent className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Loan Schemes</span>
          </Link>
          <Link
            to="/admin-mobile/applications"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Applications</span>
          </Link>
          <Link
            to="/admin-mobile/reports"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <BarChart3 className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MobileDashboard
