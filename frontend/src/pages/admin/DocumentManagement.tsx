import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileCheck2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  UserCheck,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Document, PaginatedResponse } from '@/types'
import { StatusBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { DOCUMENT_CATEGORY_OPTIONS } from '@/utils/constants'

export const DocumentManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Verification modal state
  const [verifyDoc, setVerifyDoc] = useState<Document | null>(null)
  const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified')
  const [rejectionRemarks, setRejectionRemarks] = useState('')

  // 1. Fetch Documents
  const { data: documentsData, isLoading } = useQuery<PaginatedResponse<Document>>({
    queryKey: ['adminDocuments', page, pageSize, statusFilter, categoryFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      return apiClient.get<PaginatedResponse<Document>>('/documents', params)
    },
  })

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
    }: {
      id: string
      status: string
      remarks?: string
    }) => apiClient.patch(`/documents/${id}/verify`, { status, rejection_remarks: remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDocuments'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setVerifyDoc(null)
      setRejectionRemarks('')
    },
  })

  const handleDownload = (id: string) => {
    window.open(`/api/v1/documents/${id}/download`, '_blank')
  }

  const handleOpenVerifyModal = (doc: Document, status: 'verified' | 'rejected') => {
    setVerifyDoc(doc)
    setVerifyStatus(status)
    setRejectionRemarks('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-purple-600" />
            Document Verification Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Underwrite and verify customer KYC dockets, PAN, bank statements, and income credentials.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Verification Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified Documents</option>
            <option value="rejected">Rejected Dockets</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Document Categories</option>
            {DOCUMENT_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter || categoryFilter) && (
          <button
            onClick={() => {
              setStatusFilter('')
              setCategoryFilter('')
              setPage(1)
            }}
            className="text-xs text-rose-600 font-medium hover:text-rose-700 ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : documentsData && documentsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Document / File</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Audit Note / Remark</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentsData.items.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">
                            {doc.file_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {Math.round(doc.file_size / 1024)} KB • {doc.mime_type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {doc.customer_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        {doc.uploaded_by_name || 'Staff'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.verification_status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={doc.rejection_remarks || ''}>
                      {doc.rejection_remarks ? (
                        <span className="text-rose-600 font-medium">{doc.rejection_remarks}</span>
                      ) : doc.verified_by_name ? (
                        <span className="text-emerald-700 font-medium">
                          Verified by {doc.verified_by_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Download Document"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {doc.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenVerifyModal(doc, 'verified')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleOpenVerifyModal(doc, 'rejected')}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No documents in queue"
            description="Documents uploaded by staff members for customer applications will appear here."
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={documentsData?.pages || 1}
          totalItems={documentsData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Verify / Reject Modal */}
      <Modal
        isOpen={!!verifyDoc}
        onClose={() => setVerifyDoc(null)}
        title={verifyStatus === 'verified' ? 'Verify Customer Document' : 'Reject Customer Document'}
        subtitle={`Reviewing ${verifyDoc?.category.toUpperCase()} - ${verifyDoc?.file_name}`}
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!verifyDoc) return
            verifyMutation.mutate({
              id: verifyDoc.id,
              status: verifyStatus,
              remarks: rejectionRemarks,
            })
          }}
          className="space-y-4 text-xs"
        >
          {verifyStatus === 'verified' ? (
            <p className="text-slate-600">
              Confirm that this document has been inspected and meets bank compliance standards.
            </p>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rejection Remarks / Deficiency Note *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="e.g. Document copy is blurry or missing company stamp."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setVerifyDoc(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className={`px-4 py-1.5 font-medium text-white rounded-lg ${
                verifyStatus === 'verified'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {verifyMutation.isPending ? 'Processing...' : `Confirm ${verifyStatus}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
