import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Share2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Lead, Employee, PaginatedResponse } from '@/types'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

export const MobileDistribution: React.FC = () => {
  const queryClient = useQueryClient()
  const [method, setMethod] = useState<'equal' | 'round_robin'>('equal')
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([])
  const [resultMessage, setResultMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Fetch Unassigned Leads
  const { data: unassignedData, isLoading: loadingLeads } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['unassignedLeadsMobile'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?status=new&page_size=100'),
  })

  // 2. Fetch Active Employees
  const { data: employeesData, isLoading: loadingEmployees } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['activeEmployeesForDistributionMobile'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?is_active=true&page_size=50'),
  })

  // Select all employees by default when loaded
  React.useEffect(() => {
    if (employeesData?.items && selectedEmpIds.length === 0) {
      setSelectedEmpIds(employeesData.items.map((e) => e.id))
    }
  }, [employeesData])

  // Bulk Distribute Mutation
  const distributeMutation = useMutation({
    mutationFn: (payload: { lead_ids: string[]; employee_ids: string[]; method: string }) =>
      apiClient.post('/leads/bulk-assign', payload),
    onSuccess: (res: any) => {
      setResultMessage(
        `Successfully distributed ${res.assigned_count || 'all'} leads across ${selectedEmpIds.length} agents.`
      )
      setErrorMessage('')
      queryClient.invalidateQueries({ queryKey: ['unassignedLeadsMobile'] })
      queryClient.invalidateQueries({ queryKey: ['mobileLeads'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Distribution failed.')
      setResultMessage('')
    },
  })

  const unassignedCount = unassignedData?.total || 0
  const unassignedLeadIds = unassignedData?.items?.map((l) => l.id) || []
  const selectedCount = selectedEmpIds.length

  const perAgent = selectedCount > 0 ? Math.floor(unassignedCount / selectedCount) : 0
  const remainder = selectedCount > 0 ? unassignedCount % selectedCount : 0

  const handleToggleEmp = (id: string) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter((e) => e !== id))
    } else {
      setSelectedEmpIds([...selectedEmpIds, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedEmpIds.length === (employeesData?.items.length || 0)) {
      setSelectedEmpIds([])
    } else {
      setSelectedEmpIds(employeesData?.items.map((e) => e.id) || [])
    }
  }

  const handleExecute = () => {
    setErrorMessage('')
    setResultMessage('')
    if (unassignedLeadIds.length === 0) {
      setErrorMessage('No unassigned leads found in queue.')
      return
    }
    if (selectedEmpIds.length === 0) {
      setErrorMessage('Select at least one active employee.')
      return
    }

    distributeMutation.mutate({
      lead_ids: unassignedLeadIds,
      employee_ids: selectedEmpIds,
      method,
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Lead Distribution Engine</h1>
        <p className="text-xs text-slate-500">
          Evenly partition incoming customer lead batches among active call centre agents.
        </p>
      </div>

      {resultMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{resultMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Batch Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-xl text-white shadow-xs space-y-2">
        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
          Pending Ingestion Queue
        </span>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold">{unassignedCount}</div>
            <div className="text-xs text-blue-200">Unassigned customer leads</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400">{selectedCount}</div>
            <div className="text-xs text-blue-200">Selected agents</div>
          </div>
        </div>

        {unassignedCount > 0 && selectedCount > 0 && (
          <div className="pt-2 border-t border-blue-800/60 text-xs text-blue-100 flex items-center justify-between">
            <span>Quota per agent:</span>
            <span className="font-bold text-white">
              ~{perAgent} leads {remainder > 0 && `(+${remainder} distributed)`}
            </span>
          </div>
        )}
      </div>

      {/* Strategy Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Distribution Algorithm
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMethod('equal')}
            className={`p-3 rounded-xl border text-left transition ${
              method === 'equal'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold">Equal Split</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Even division with remainder allocated
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('round_robin')}
            className={`p-3 rounded-xl border text-left transition ${
              method === 'round_robin'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold">Round Robin</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Sequential 1-by-1 lead rotation
            </div>
          </button>
        </div>
      </div>

      {/* Select Call Centre Agents */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Agents ({selectedCount})
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            {selectedEmpIds.length === (employeesData?.items.length || 0)
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        {loadingEmployees ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employeesData?.items.map((emp) => {
              const isSelected = selectedEmpIds.includes(emp.id)
              return (
                <div
                  key={emp.id}
                  onClick={() => handleToggleEmp(emp.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-medium'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">{emp.user.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {emp.employee_id} • Target: {emp.daily_call_target} calls/day
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Execute Button */}
      <button
        type="button"
        disabled={distributeMutation.isPending || unassignedCount === 0 || selectedCount === 0}
        onClick={handleExecute}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 transition flex items-center justify-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        {distributeMutation.isPending
          ? 'Distributing Leads...'
          : `Distribute ${unassignedCount} Leads to ${selectedCount} Agents`}
      </button>
    </div>
  )
}
