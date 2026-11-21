import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Bank, PaginatedResponse } from '@/types'
import { Modal } from '@/components/common/Modal'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const MobileBanks: React.FC = () => {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
  })
  const [formError, setFormError] = useState('')

  // Fetch Banks
  const { data: banksData, isLoading } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['mobileAdminBanks'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?page=1&page_size=50'),
  })

  // Create Bank Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/banks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminBanks'] })
      setIsAddOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to add bank.')
    },
  })

  // Update Bank Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/banks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminBanks'] })
      setEditingBank(null)
      resetForm()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to update bank.')
    },
  })

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.put(`/banks/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminBanks'] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
    })
    setFormError('')
  }

  const handleOpenEdit = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      code: bank.code,
      contact_person: bank.contact_person || '',
      contact_email: bank.contact_email || '',
      contact_phone: bank.contact_phone || '',
    })
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formData.name || !formData.code) {
      setFormError('Bank name and code are required.')
      return
    }

    if (editingBank) {
      updateMutation.mutate({ id: editingBank.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Partner Banks</h1>
          <p className="text-xs text-slate-500">{banksData?.total || 0} financial institutions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Add Bank
        </button>
      </div>

      {/* Banks List */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : !banksData || banksData.items.length === 0 ? (
        <EmptyState
          title="No banks found"
          description="Add your first lending partner bank."
          action={{
            label: 'Add Bank',
            onClick: () => setIsAddOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {banksData.items.map((bank) => (
            <div
              key={bank.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold text-xs uppercase">
                    {bank.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{bank.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">Code: {bank.code}</div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: bank.id,
                      is_active: !bank.is_active,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    bank.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {bank.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              {(bank.contact_person || bank.contact_email || bank.contact_phone) && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-600">
                  {bank.contact_person && (
                    <div>
                      <span className="text-slate-400">Rep: </span>
                      <strong className="text-slate-800">{bank.contact_person}</strong>
                    </div>
                  )}
                  {bank.contact_phone && (
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{bank.contact_phone}</span>
                    </div>
                  )}
                  {bank.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{bank.contact_email}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(bank)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded bg-slate-100"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Bank
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Bank Modal */}
      <Modal
        isOpen={isAddOpen || !!editingBank}
        onClose={() => {
          setIsAddOpen(false)
          setEditingBank(null)
          resetForm()
        }}
        title={editingBank ? `Edit: ${editingBank.name}` : 'Add Partner Bank'}
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
              Bank Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="e.g. HDFC Bank"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bank Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-mono uppercase"
              placeholder="HDFC"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Officer</label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="e.g. Rajesh Nair"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="loans@hdfc.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="1800200333"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false)
                setEditingBank(null)
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Bank'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
