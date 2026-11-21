import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgePercent,
  Plus,
  Building2,
  Calendar,
  Percent,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { LoanScheme, Bank, PaginatedResponse } from '@/types'
import { Modal } from '@/components/common/Modal'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const MobileSchemes: React.FC = () => {
  const queryClient = useQueryClient()
  const [bankFilter, setBankFilter] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<LoanScheme | null>(null)

  const [formData, setFormData] = useState({
    bank_id: '',
    scheme_name: '',
    loan_category: 'Personal Loan',
    min_amount: '50000',
    max_amount: '2000000',
    interest_rate: '10.5',
    min_tenure_months: '12',
    max_tenure_months: '60',
    eligibility_info: '',
  })
  const [formError, setFormError] = useState('')

  // 1. Fetch Schemes
  const { data: schemesData, isLoading } = useQuery<PaginatedResponse<LoanScheme>>({
    queryKey: ['mobileAdminSchemes', bankFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<LoanScheme>>('/loan-schemes', {
        page: 1,
        page_size: 50,
        ...(bankFilter ? { bank_id: bankFilter } : {}),
      }),
  })

  // 2. Fetch Banks for selector
  const { data: banksData } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['activeBanksForMobileSchemes'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?page_size=50'),
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/loan-schemes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminSchemes'] })
      setIsAddOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to create scheme.')
    },
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/loan-schemes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminSchemes'] })
      setEditingScheme(null)
      resetForm()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to update scheme.')
    },
  })

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.put(`/loan-schemes/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminSchemes'] })
    },
  })

  const resetForm = () => {
    setFormData({
      bank_id: '',
      scheme_name: '',
      loan_category: 'Personal Loan',
      min_amount: '50000',
      max_amount: '2000000',
      interest_rate: '10.5',
      min_tenure_months: '12',
      max_tenure_months: '60',
      eligibility_info: '',
    })
    setFormError('')
  }

  const handleOpenEdit = (scheme: LoanScheme) => {
    setEditingScheme(scheme)
    setFormData({
      bank_id: scheme.bank_id,
      scheme_name: scheme.scheme_name,
      loan_category: scheme.loan_category,
      min_amount: String(scheme.min_amount),
      max_amount: String(scheme.max_amount),
      interest_rate: String(scheme.interest_rate),
      min_tenure_months: String(scheme.min_tenure_months),
      max_tenure_months: String(scheme.max_tenure_months),
      eligibility_info: scheme.eligibility_info || '',
    })
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formData.bank_id || !formData.scheme_name || !formData.interest_rate) {
      setFormError('Bank, scheme name, and interest rate are required.')
      return
    }

    const payload = {
      ...formData,
      min_amount: Number(formData.min_amount),
      max_amount: Number(formData.max_amount),
      interest_rate: Number(formData.interest_rate),
      min_tenure_months: Number(formData.min_tenure_months),
      max_tenure_months: Number(formData.max_tenure_months),
      eligibility_info: formData.eligibility_info.trim() || undefined,
    }

    if (editingScheme) {
      updateMutation.mutate({ id: editingScheme.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Loan Schemes</h1>
          <p className="text-xs text-slate-500">{schemesData?.total || 0} active lending products</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Add Scheme
        </button>
      </div>

      {/* Filter by Bank */}
      <div>
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Partner Banks</option>
          {banksData?.items.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* Schemes List */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : !schemesData || schemesData.items.length === 0 ? (
        <EmptyState
          title="No loan schemes found"
          description="Create your first bank loan scheme to enable applications."
          action={{
            label: 'Add Loan Scheme',
            onClick: () => setIsAddOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {schemesData.items.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{scheme.scheme_name}</h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {scheme.bank_name || 'Partner Bank'} • {scheme.loan_category}
                  </div>
                </div>

                <button
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: scheme.id,
                      is_active: !scheme.is_active,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    scheme.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {scheme.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Interest Rate</span>
                  <span className="font-extrabold text-blue-600 font-mono text-sm">
                    {scheme.interest_rate}% p.a.
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Tenure</span>
                  <span className="font-semibold text-slate-800">
                    {scheme.min_tenure_months} - {scheme.max_tenure_months} mos
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Loan Range</span>
                  <span className="font-medium text-slate-700 font-mono">
                    ₹{scheme.min_amount.toLocaleString()} — ₹{scheme.max_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {scheme.eligibility_info && (
                <p className="text-xs text-slate-600 bg-blue-50/40 p-2 rounded-lg border border-blue-100/60">
                  <strong className="text-slate-700">Eligibility:</strong> {scheme.eligibility_info}
                </p>
              )}

              <div className="flex justify-end pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(scheme)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded bg-slate-100"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Scheme
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Scheme Modal */}
      <Modal
        isOpen={isAddOpen || !!editingScheme}
        onClose={() => {
          setIsAddOpen(false)
          setEditingScheme(null)
          resetForm()
        }}
        title={editingScheme ? `Edit: ${editingScheme.scheme_name}` : 'Add Loan Scheme'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lending Bank <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.bank_id}
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900"
              required
            >
              <option value="">-- Select Bank --</option>
              {banksData?.items.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scheme Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="e.g. HDFC Express Personal Loan"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.loan_category}
                onChange={(e) => setFormData({ ...formData, loan_category: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900"
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interest Rate (% p.a.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="10.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Amount (₹)</label>
              <input
                type="number"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Tenure (mos)</label>
              <input
                type="number"
                value={formData.min_tenure_months}
                onChange={(e) => setFormData({ ...formData, min_tenure_months: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Tenure (mos)</label>
              <input
                type="number"
                value={formData.max_tenure_months}
                onChange={(e) => setFormData({ ...formData, max_tenure_months: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
            <textarea
              rows={2}
              value={formData.eligibility_info}
              onChange={(e) => setFormData({ ...formData, eligibility_info: e.target.value })}
              placeholder="Min salary 25k, CIBIL 700+, 2 years job stability..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false)
                setEditingScheme(null)
                resetForm()
              }}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Scheme'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
