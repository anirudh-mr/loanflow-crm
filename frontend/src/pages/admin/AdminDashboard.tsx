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
  Landmark,
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

// Refined institutional banking palette (Slate, Mist Blue, Emerald, Amber, Stone)
const CHART_COLORS = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#64748b', '#94a3b8']

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
    <div className="space-y-6 text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* Top Hero Command Console with Interactive 3D Visualizer */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span>LIVE TELEMETRY • SUPABASE REALTIME STREAM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Executive Loan Operations
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time multi-agent orchestration across 20 call centre representatives, institutional partner banks, automated underwriting, and document verification.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                to="/admin/leads"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl shadow-2xs transition-all hover:scale-[1.01]"
              >
                <UploadCloud className="h-4 w-4 text-slate-600" />
                <span>Upload CSV Leads</span>
              </Link>
              <Link
                to="/admin/distribution"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
              >
                <Share2 className="h-4 w-4" />
                <span>Distribute Leads</span>
              </Link>
              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl shadow-2xs transition-all hover:scale-[1.01]"
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-600" />
                <span>BI Reports</span>
              </Link>
            </div>
          </div>

          {/* Interactive 3D Banking Capital & Loan Milestones Sculpture */}
          <div className="shrink-0 flex items-center justify-center">
            <FintechOrbital3D
              size={230}
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
      {/* 3D KPI Tilt Cards Grid (Light Mist Theme) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Total Leads */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Leads</span>
                <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.total_leads || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{stats?.unassigned_leads || 0} unallocated</span>
              </div>
            </Card3D>

            {/* Calls Today */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Calls Today</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.calls_today || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-700 font-mono font-semibold">
                <span>Target: {targetPercentage}%</span>
              </div>
            </Card3D>

            {/* Interested Prospects */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Interested</span>
                <div className="h-7 w-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.interested_customers || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-purple-700 font-mono">
                <span>Warm prospects</span>
              </div>
            </Card3D>

            {/* Follow-ups Today */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Follow-ups</span>
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.followups_due_today || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-rose-700 font-mono">
                <span>{stats?.overdue_followups || 0} overdue</span>
              </div>
            </Card3D>

            {/* Pending Docs */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Docs</span>
                <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.pending_documents || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 font-mono">
                <span>In verification</span>
              </div>
            </Card3D>

            {/* Disbursed Loans */}
            <Card3D className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Disbursed</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <BadgeDollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.disbursed_loans || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-700 font-mono font-semibold">
                <span>{stats?.approved_loans || 0} approved</span>
              </div>
            </Card3D>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Charts Row 1: Daily Calls & Weekly Leads (Light Mist Glass) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Call Activity */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Daily Call Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Call interaction volume across all 20 agents</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              14-Day Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCalls || []}>
                <defs>
                  <linearGradient id="colorCallsMist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="formatted_date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCallsMist)"
                  name="Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Lead Generation */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                Weekly Lead Ingestion
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Inbound & bulk CSV acquired profiles</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              8-Week Batch
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLeads || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="count" fill="#1e293b" radius={[6, 6, 0, 0]} name="Leads" />
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
        <div className="lg:col-span-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Representative Performance Ranking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily 100-call quota tracking and loan conversions</p>
            </div>
            <Link
              to="/admin/employees"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>Manage Roster</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Agent</th>
                  <th className="py-2.5 px-3 font-semibold">Team</th>
                  <th className="py-2.5 px-3 font-semibold">Calls Today</th>
                  <th className="py-2.5 px-3 font-semibold">Quota (100)</th>
                  <th className="py-2.5 px-3 font-semibold">Interested</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Sanctioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((emp: any, idx: number) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-stone-200 text-stone-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {emp.employee_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{emp.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{emp.department}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{emp.calls}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 w-28">
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-slate-900 h-full rounded-full"
                              style={{ width: `${Math.min(emp.completion_pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">
                            {emp.completion_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{emp.interested}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
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
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Lead Status Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">Portfolio breakdown by stage</p>
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
                  paddingAngle={3}
                >
                  {(leadDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-[11px]">
            {(leadDistribution || []).slice(0, 4).map((item, idx) => (
              <div key={item.status} className="flex items-center gap-1.5 text-slate-700">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="truncate">{item.status}:</span>
                <strong className="text-slate-900 ml-auto font-mono">{item.count}</strong>
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
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-slate-700" />
                Institutional Loan Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live applications under banking progression</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Grid</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={loanPipeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={110}
                />
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
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Conversion */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                End-to-End Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Lead intake to sanctioned bank loan disbursement</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Pipeline Health
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {(funnel || []).map((stage: any) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">{stage.count} profiles</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {stage.conversion_rate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-700"
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
