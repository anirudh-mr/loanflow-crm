import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  BadgeDollarSign,
  TrendingUp,
  ArrowUpRight,
  Share2,
  Plus,
  UploadCloud,
  FileSpreadsheet,
  Activity,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '@/services/api'
import { DashboardStats } from '@/types'
import { SkeletonCard } from '@/components/common/LoadingSkeleton'
import { Card3D } from '@/components/common/Card3D'
import { FintechOrbital3D } from '@/components/common/FintechOrbital3D'

const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6']

export const AdminDashboard: React.FC = () => {
  // 1. Dashboard summary metrics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: () => apiClient.get<DashboardStats>('/analytics/dashboard'),
  })

  // 2. Daily call activity chart data
  const { data: dailyCalls } = useQuery<any[]>({
    queryKey: ['adminDailyCalls'],
    queryFn: () => apiClient.get<any[]>('/analytics/daily-calls?days=14'),
  })

  // 3. Weekly leads chart data
  const { data: weeklyLeads } = useQuery<any[]>({
    queryKey: ['adminWeeklyLeads'],
    queryFn: () => apiClient.get<any[]>('/analytics/weekly-leads?weeks=8'),
  })

  // 4. Employee leaderboard
  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ['adminLeaderboard'],
    queryFn: () => apiClient.get<any[]>('/analytics/leaderboard'),
  })

  // 5. Lead status distribution
  const { data: leadDistribution } = useQuery<any[]>({
    queryKey: ['adminLeadDistribution'],
    queryFn: () => apiClient.get<any[]>('/analytics/lead-distribution'),
  })

  // 6. Loan pipeline stages
  const { data: loanPipeline } = useQuery<any[]>({
    queryKey: ['adminLoanPipeline'],
    queryFn: () => apiClient.get<any[]>('/analytics/loan-pipeline'),
  })

  // 7. Conversion Funnel
  const { data: funnel } = useQuery<any[]>({
    queryKey: ['adminConversionFunnel'],
    queryFn: () => apiClient.get<any[]>('/analytics/conversion-funnel'),
  })

  const targetPercentage =
    stats && stats.daily_target > 0
      ? Math.min(Math.round((stats.calls_today / stats.daily_target) * 100), 100)
      : 0

  return (
    <div className="space-y-6 text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* Top Hero Command Console with Interactive 3D Visualizer */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/60 backdrop-blur-2xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        {/* Ambient glow mesh */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium shadow-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE TELEMETRY • SUPABASE REALTIME STREAM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              Executive Loan Command
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time multi-agent orchestration across 20 call centre representatives, institutional partner banks, automated underwriting, and document verification.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                to="/admin/leads"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="h-4 w-4 text-cyan-400" />
                <span>Upload CSV Leads</span>
              </Link>
              <Link
                to="/admin/distribution"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
              >
                <Share2 className="h-4 w-4" />
                <span>Distribute Leads</span>
              </Link>
              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span>BI Reports</span>
              </Link>
            </div>
          </div>

          {/* Interactive 3D Quantum Loan Core */}
          <div className="shrink-0 flex items-center justify-center">
            <FintechOrbital3D
              size={220}
              stats={{
                approvedRate: 88.4,
                activeLeads: stats?.total_leads || 25,
                processingSpeed: '0.4s',
              }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3D KPI Tilt Cards Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Total Leads */}
            <Card3D glowColor="cyan" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Leads</span>
                <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                {stats?.total_leads || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-cyan-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>{stats?.unassigned_leads || 0} unallocated</span>
              </div>
            </Card3D>

            {/* Calls Today */}
            <Card3D glowColor="emerald" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Calls Today</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                {stats?.calls_today || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-mono">
                <Zap className="h-3 w-3" />
                <span>Quota: {targetPercentage}%</span>
              </div>
            </Card3D>

            {/* Interested Prospects */}
            <Card3D glowColor="purple" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Interested</span>
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
                {stats?.interested_customers || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-purple-400 font-mono">
                <Sparkles className="h-3 w-3" />
                <span>Warm prospects</span>
              </div>
            </Card3D>

            {/* Follow-ups Today */}
            <Card3D glowColor="amber" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Follow-ups</span>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                {stats?.followups_due_today || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-rose-400 font-mono">
                <AlertCircle className="h-3 w-3" />
                <span>{stats?.overdue_followups || 0} overdue</span>
              </div>
            </Card3D>

            {/* Pending Docs */}
            <Card3D glowColor="blue" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Docs</span>
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                {stats?.pending_documents || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-400 font-mono">
                <Layers className="h-3 w-3" />
                <span>In verification</span>
              </div>
            </Card3D>

            {/* Disbursed Loans */}
            <Card3D glowColor="emerald" className="p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Disbursed</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BadgeDollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                {stats?.disbursed_loans || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-mono">
                <Shield className="h-3 w-3" />
                <span>{stats?.approved_loans || 0} approved</span>
              </div>
            </Card3D>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Charts Row 1: Daily Calls & Weekly Leads (Dark Cyber Glass) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Call Activity */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Daily Call Activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Call interaction volume across all 20 agents</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              14-Day Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCalls || []}>
                <defs>
                  <linearGradient id="colorCallsNeon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="formatted_date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCallsNeon)"
                  name="Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Lead Generation */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Weekly Lead Ingestion
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Inbound & bulk CSV acquired profiles</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              8-Week Batch
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLeads || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Row 2: Leaderboard & Lead Status Distribution */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Performance Leaderboard */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Representative Performance Ranking
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily 100-call quota tracking and loan conversions</p>
            </div>
            <Link
              to="/admin/employees"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage Roster</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Calls Today</th>
                  <th className="py-2.5 px-3">Quota (100)</th>
                  <th className="py-2.5 px-3">Interested</th>
                  <th className="py-2.5 px-3 text-right">Sanctioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((emp: any, idx: number) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : idx === 1
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                                : idx === 2
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-100 block">
                              {emp.employee_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{emp.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{emp.department}</td>
                      <td className="py-3 px-3 font-semibold text-slate-100">{emp.calls}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 w-28">
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                              style={{ width: `${Math.min(emp.completion_pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            {emp.completion_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-purple-300 font-medium">{emp.interested}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                          {emp.conversions}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Synchronizing active representative telemetry...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Status Distribution Donut Chart */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Lead Status Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Portfolio breakdown by stage</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(leadDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-800 text-[11px]">
            {(leadDistribution || []).slice(0, 4).map((item, idx) => (
              <div key={item.status} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate">{item.status}:</span>
                <strong className="text-white ml-auto font-mono">{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Row 3: Pipeline & Funnel Conversion Visualization */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Application Pipeline */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-purple-400" />
                Institutional Loan Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Live applications under banking progression</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View Grid</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={loanPipeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 10, fill: '#cbd5e1' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Conversion */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                End-to-End Conversion Funnel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Lead intake to sanctioned bank loan disbursement</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Pipeline Health
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {(funnel || []).map((stage: any) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{stage.count} profiles</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {stage.conversion_rate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(stage.conversion_rate, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
