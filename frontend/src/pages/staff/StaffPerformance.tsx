import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  Target,
  PhoneCall,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Users,
  Trophy,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { apiClient } from '@/services/api'
import { StaffDashboardStats, CallProgress } from '@/types'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useAuth } from '@/context/AuthContext'

interface LeaderboardItem {
  id: string
  name: string
  employee_id: string
  department?: string
  calls_today: number
  target: number
  target_pct: number
  conversions: number
}

interface DailyCallPoint {
  date: string
  calls: number
}

export const StaffPerformance: React.FC = () => {
  const { user } = useAuth()

  // 1. Staff Telemetry
  const { data: stats, isLoading: loadingStats } = useQuery<StaffDashboardStats>({
    queryKey: ['staffDashboardStats'],
    queryFn: () => apiClient.get<StaffDashboardStats>('/analytics/staff-dashboard'),
  })

  // 2. Real-time Target
  const { data: progress } = useQuery<CallProgress>({
    queryKey: ['staffCallProgress'],
    queryFn: () => apiClient.get<CallProgress>('/calls/progress'),
  })

  // 3. Daily Call Chart Data (14 Days)
  const { data: chartData, isLoading: loadingChart } = useQuery<DailyCallPoint[]>({
    queryKey: ['staffDailyCallsTrend'],
    queryFn: () => apiClient.get<DailyCallPoint[]>('/analytics/daily-calls?days=14'),
  })

  // 4. Team Leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<LeaderboardItem[]>({
    queryKey: ['teamLeaderboard'],
    queryFn: () => apiClient.get<LeaderboardItem[]>('/analytics/leaderboard'),
  })

  const completed = progress?.completed || stats?.calls_completed || 0
  const target = progress?.target || stats?.daily_call_target || 100
  const remaining = Math.max(0, target - completed)
  const pct = Math.min(Math.round((completed / target) * 100), 100)

  // Find user's rank
  const myRank = leaderboard
    ? leaderboard.findIndex((item) => item.name === user?.full_name || item.name.includes(user?.full_name || '')) + 1
    : 0

  return (
    <div className="space-y-6">
      {/* Hero Performance Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Official Call Centre KPIs
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Performance & Shift Analytics</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Track your daily 100-call quota pacing, lead conversion yields, and position on the team leaderboard.
            </p>
          </div>

          {/* Quick Stat Badge */}
          <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-6 py-4 rounded-xl border border-slate-700">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Team Rank</div>
              <div className="text-2xl font-extrabold text-white">
                {myRank > 0 ? `#${myRank} of ${leaderboard?.length || 20}` : 'Top Performer'}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">Active Call Centre Agent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Today</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{completed}</span>
            <span className="text-xs font-medium text-slate-500">/ {target} goal</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{pct}% achieved</span>
            <span className="font-semibold text-slate-700">{remaining} remaining</span>
          </div>
        </div>

        {/* Interested Leads */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interested Leads</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600">
              {stats?.interested_customers || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">prospects</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            High-intent borrowers ready for loan scheme recommendation
          </p>
        </div>

        {/* Active Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Submissions</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {stats?.active_applications || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">in underwriting</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Customer applications submitted to lending partners
          </p>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-ups Today</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {stats?.followups_due_today || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">scheduled</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
            {stats?.overdue_followups && stats.overdue_followups > 0 ? (
              <span className="text-rose-600 font-semibold">
                {stats.overdue_followups} overdue callbacks
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">All callbacks up to date</span>
            )}
          </div>
        </div>
      </div>

      {/* Calling Trends Area Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">14-Day Call Volume Trend</h3>
            <p className="text-xs text-slate-500">
              Daily customer calls logged against the company standard 100-call benchmark.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Daily Calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 bg-rose-500 border-dashed" />
              <span className="text-slate-600 font-medium">100-Call Target</span>
            </div>
          </div>
        </div>

        {loadingChart ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 120]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} calls`, 'Volume']}
                />
                <ReferenceLine
                  y={100}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: '100 Target',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#callsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Team Leaderboard Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Shift Calling Leaderboard</h3>
            <p className="text-xs text-slate-500">Live rankings of call centre agents based on calls logged today.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Target: 100 Calls / Agent
          </span>
        </div>

        {loadingLeaderboard ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Calls Today</th>
                  <th className="py-3 px-4">Target Progress</th>
                  <th className="py-3 px-4">Loan Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {leaderboard?.slice(0, 10).map((agent, index) => {
                  const isCurrent =
                    agent.name === user?.full_name || agent.name.includes(user?.full_name || '')
                  return (
                    <tr
                      key={agent.id}
                      className={`hover:bg-slate-50/60 transition ${
                        isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-400 text-white font-bold text-xs shadow-xs">
                            1
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-2">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium flex items-center gap-1.5">
                          {agent.name}
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {agent.employee_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {agent.calls_today}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(agent.target_pct, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-600 text-[11px]">
                            {agent.target_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {agent.conversions}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
