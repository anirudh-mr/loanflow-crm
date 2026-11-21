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
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { apiClient } from '@/services/api'
import { DashboardStats } from '@/types'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

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
    <div className="p-4 space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-700/50">
            Executive Control
          </span>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </div>
        <h1 className="text-xl font-bold mt-2">Executive Admin Portal</h1>
        <p className="text-xs text-slate-300 mt-1">
          Real-time oversight of customer leads, call centre productivity, and banking partner loan files.
        </p>

        {/* Action Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <Link
            to="/admin-mobile/distribution"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            Distribute Leads
          </Link>
          <Link
            to="/admin-mobile/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg shrink-0 border border-slate-700"
          >
            <Users className="h-3.5 w-3.5 text-blue-400" />
            Manage Leads
          </Link>
          <Link
            to="/admin-mobile/documents"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg shrink-0 border border-slate-700"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
            Verify KYC
          </Link>
        </div>
      </div>

      {/* Critical Attention Badges */}
      {stats && (stats.unassigned_leads > 0 || stats.overdue_followups > 0) && (
        <div className="space-y-2">
          {stats.unassigned_leads > 0 && (
            <Link
              to="/admin-mobile/distribution"
              className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs active:bg-amber-100 transition"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{stats.unassigned_leads} leads</strong> pending assignment to staff.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-600 shrink-0" />
            </Link>
          )}

          {stats.overdue_followups > 0 && (
            <Link
              to="/admin-mobile/followups"
              className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs active:bg-rose-100 transition"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>{stats.overdue_followups} follow-ups</strong> are past due date.
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-600 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* Primary KPI Grid (2 columns on mobile) */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/admin-mobile/leads"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Leads</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.total_leads || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">+{stats?.leads_today || 0} today</div>
        </Link>

        <Link
          to="/admin-mobile/calls"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Calls Today</span>
            <PhoneCall className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{stats?.calls_today || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Goal: {stats?.daily_target || 2000}</div>
        </Link>

        <Link
          to="/admin-mobile/applications"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{stats?.approved_loans || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">₹{((stats?.disbursed_loans || 0) * 450000).toLocaleString()} disbursed</div>
        </Link>

        <Link
          to="/admin-mobile/documents"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending KYC</span>
            <FileCheck2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats?.pending_documents || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Requires review</div>
        </Link>
      </div>

      {/* Calling Trends Area Chart */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-900">7-Day Call Volume</span>
          <span className="text-[10px] text-slate-500">Live Telemetry</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={callChart || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileCallsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} fill="url(#mobileCallsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Administrative Modules Navigation Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          All Management Modules
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/admin-mobile/leads"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-800">Leads CRM</span>
          </Link>
          <Link
            to="/admin-mobile/employees"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <UserCheck className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-slate-800">Employees</span>
          </Link>
          <Link
            to="/admin-mobile/distribution"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <Share2 className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">Distribution</span>
          </Link>
          <Link
            to="/admin-mobile/calls"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <PhoneCall className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">Calls</span>
          </Link>
          <Link
            to="/admin-mobile/followups"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <CalendarClock className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-slate-800">Follow-ups</span>
          </Link>
          <Link
            to="/admin-mobile/documents"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <FileCheck2 className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-slate-800">KYC Docs</span>
          </Link>
          <Link
            to="/admin-mobile/banks"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <Building2 className="h-4 w-4 text-sky-600" />
            <span className="font-semibold text-slate-800">Partner Banks</span>
          </Link>
          <Link
            to="/admin-mobile/schemes"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <BadgePercent className="h-4 w-4 text-pink-600" />
            <span className="font-semibold text-slate-800">Loan Schemes</span>
          </Link>
          <Link
            to="/admin-mobile/applications"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-rose-600" />
            <span className="font-semibold text-slate-800">Applications</span>
          </Link>
          <Link
            to="/admin-mobile/reports"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 active:bg-blue-50 border border-slate-100 transition"
          >
            <BarChart3 className="h-4 w-4 text-slate-600" />
            <span className="font-semibold text-slate-800">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
