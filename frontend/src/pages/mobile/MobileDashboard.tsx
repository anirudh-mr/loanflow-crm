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
    <div className="p-4 space-y-5 text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* Welcome Banner (Cyber Glass) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-950/70 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              EXECUTIVE MOBILE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
          </div>

          <h1 className="text-xl font-extrabold mt-2 bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Mobile Command
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time oversight of customer leads, 20 call agents, and institutional banking pipeline.
          </p>

          {/* Action Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <Link
              to="/admin-mobile/distribution"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold rounded-xl shrink-0 shadow-md shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              <Share2 className="h-3.5 w-3.5" />
              Distribute
            </Link>
            <Link
              to="/admin-mobile/leads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold rounded-xl shrink-0 border border-slate-700 active:scale-95 transition-transform"
            >
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Leads CRM
            </Link>
            <Link
              to="/admin-mobile/documents"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold rounded-xl shrink-0 border border-slate-700 active:scale-95 transition-transform"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
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
              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs active:bg-amber-500/20 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                <span>
                  <strong className="font-mono">{stats.unassigned_leads} leads</strong> require agent assignment.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 shrink-0" />
            </Link>
          )}

          {stats.overdue_followups > 0 && (
            <Link
              to="/admin-mobile/followups"
              className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs active:bg-rose-500/20 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
                <span>
                  <strong className="font-mono">{stats.overdue_followups} follow-ups</strong> are overdue.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3D Touch-Reactive KPI Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/admin-mobile/leads" className="block">
          <Card3D glowColor="cyan" className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leads</span>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mt-2">
              {stats?.total_leads || 0}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-1">+{stats?.leads_today || 0} today</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/calls" className="block">
          <Card3D glowColor="emerald" className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calls Today</span>
              <PhoneCall className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent mt-2 font-mono">
              {stats?.calls_today || 0}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">Goal: {stats?.daily_target || 2000}</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/applications" className="block">
          <Card3D glowColor="purple" className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mt-2 font-mono">
              {stats?.approved_loans || 0}
            </div>
            <div className="text-[10px] text-purple-400 font-mono mt-1">{stats?.disbursed_loans || 0} disbursed</div>
          </Card3D>
        </Link>

        <Link to="/admin-mobile/documents" className="block">
          <Card3D glowColor="amber" className="p-4 active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending KYC</span>
              <FileCheck2 className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-amber-300 bg-clip-text text-transparent mt-2 font-mono">
              {stats?.pending_documents || 0}
            </div>
            <div className="text-[10px] text-amber-400 font-mono mt-1">Verification queue</div>
          </Card3D>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Calling Trends Area Chart (Dark Cyber Glass) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-400" />
            7-Day Call Volume
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            Live Stream
          </span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={callChart || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileCallsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={2.5} fill="url(#mobileCallsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* All Administrative Modules Navigation Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-4 shadow-xl">
        <h2 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-3">
          All Management Modules
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/admin-mobile/leads"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-cyan-950/40 border border-slate-700/60 transition-all hover:border-cyan-500/40"
          >
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Leads CRM</span>
          </Link>
          <Link
            to="/admin-mobile/employees"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-purple-950/40 border border-slate-700/60 transition-all hover:border-purple-500/40"
          >
            <UserCheck className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-slate-200">Employees</span>
          </Link>
          <Link
            to="/admin-mobile/distribution"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-indigo-950/40 border border-slate-700/60 transition-all hover:border-indigo-500/40"
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Distribution</span>
          </Link>
          <Link
            to="/admin-mobile/calls"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-emerald-950/40 border border-slate-700/60 transition-all hover:border-emerald-500/40"
          >
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Calls</span>
          </Link>
          <Link
            to="/admin-mobile/followups"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-amber-950/40 border border-slate-700/60 transition-all hover:border-amber-500/40"
          >
            <CalendarClock className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-slate-200">Follow-ups</span>
          </Link>
          <Link
            to="/admin-mobile/documents"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-teal-950/40 border border-slate-700/60 transition-all hover:border-teal-500/40"
          >
            <FileCheck2 className="h-4 w-4 text-teal-400" />
            <span className="font-semibold text-slate-200">KYC Docs</span>
          </Link>
          <Link
            to="/admin-mobile/banks"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-sky-950/40 border border-slate-700/60 transition-all hover:border-sky-500/40"
          >
            <Building2 className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-slate-200">Partner Banks</span>
          </Link>
          <Link
            to="/admin-mobile/schemes"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-pink-950/40 border border-slate-700/60 transition-all hover:border-pink-500/40"
          >
            <BadgePercent className="h-4 w-4 text-pink-400" />
            <span className="font-semibold text-slate-200">Loan Schemes</span>
          </Link>
          <Link
            to="/admin-mobile/applications"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-rose-950/40 border border-slate-700/60 transition-all hover:border-rose-500/40"
          >
            <FileSpreadsheet className="h-4 w-4 text-rose-400" />
            <span className="font-semibold text-slate-200">Applications</span>
          </Link>
          <Link
            to="/admin-mobile/reports"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 active:bg-slate-700/40 border border-slate-700/60 transition-all hover:border-slate-500/40"
          >
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-200">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MobileDashboard
