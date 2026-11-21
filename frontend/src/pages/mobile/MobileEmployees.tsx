import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Mail,
  KeyRound,
  Shield,
  Target,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Award,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Employee, PaginatedResponse } from '@/types'
import { Modal } from '@/components/common/Modal'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const MobileEmployees: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  // Create Employee Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: 'Password123!',
    department: 'Sales & Calling',
    daily_call_target: 100,
  })
  const [createError, setCreateError] = useState('')

  // Reset Password Modal State
  const [resetEmp, setResetEmp] = useState<Employee | null>(null)
  const [newPassword, setNewPassword] = useState('Password123!')
  const [resetSuccess, setResetSuccess] = useState('')

  // Fetch Employees
  const { data: employeesData, isLoading } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['mobileEmployees', search],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Employee>>('/employees', {
        page: 1,
        page_size: 50,
        search: search.trim() || undefined,
      }),
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileEmployees'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setIsCreateOpen(false)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: 'Password123!',
        department: 'Sales & Calling',
        daily_call_target: 100,
      })
      setCreateError('')
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.detail || 'Failed to create employee.')
    },
  })

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.put(`/employees/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileEmployees'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
    },
  })

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiClient.post(`/employees/${id}/reset-password`, { new_password: password }),
    onSuccess: () => {
      setResetSuccess('Password has been reset successfully.')
      setTimeout(() => {
        setResetEmp(null)
        setResetSuccess('')
      }, 1500)
    },
  })

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employees</h1>
          <p className="text-xs text-slate-500">{employeesData?.total || 0} call centre agents</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search employee by name, ID, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Employee List */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !employeesData || employeesData.items.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="No employee records match your query."
          action={{
            label: 'Add First Agent',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {employeesData.items.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {emp.user.full_name}
                    {!emp.is_active && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                        Inactive
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    ID: {emp.employee_id} • {emp.department || 'Sales'}
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <button
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      id: emp.id,
                      is_active: !emp.is_active,
                    })
                  }
                  className={`p-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    emp.is_active
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-400 bg-slate-100'
                  }`}
                  title={emp.is_active ? 'Deactivate employee' : 'Activate employee'}
                >
                  {emp.is_active ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Inactive</span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Daily Goal</span>
                  <span className="font-bold text-slate-800">{emp.daily_call_target} calls/day</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Joined</span>
                  <span className="text-slate-700 font-medium">
                    {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <a
                  href={`mailto:${emp.user.email}`}
                  className="text-slate-500 hover:text-slate-900 truncate max-w-[180px]"
                >
                  {emp.user.email}
                </a>

                <button
                  onClick={() => setResetEmp(emp)}
                  className="inline-flex items-center gap-1 text-slate-600 active:text-blue-600 font-semibold text-xs py-1 px-2 rounded-lg bg-slate-100"
                >
                  <KeyRound className="h-3 w-3" />
                  Reset Pwd
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Employee Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Call Centre Agent"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setCreateError('')
            createMutation.mutate(formData)
          }}
          className="space-y-3"
        >
          {createError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="priya@loanflow.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="9876500000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Call Target
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.daily_call_target}
                onChange={(e) =>
                  setFormData({ ...formData, daily_call_target: Number(e.target.value) })
                }
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetEmp}
        onClose={() => setResetEmp(null)}
        title={`Reset Password: ${resetEmp?.user.full_name}`}
        size="sm"
      >
        <div className="space-y-3">
          {resetSuccess ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetEmp(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetPasswordMutation.isPending || !newPassword}
                  onClick={() => {
                    if (resetEmp) {
                      resetPasswordMutation.mutate({
                        id: resetEmp.id,
                        password: newPassword,
                      })
                    }
                  }}
                  className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
