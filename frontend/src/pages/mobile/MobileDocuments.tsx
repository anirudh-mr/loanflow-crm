import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileCheck2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  Eye,
  Check,
  X,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Document, PaginatedResponse } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { DOCUMENT_CATEGORY_OPTIONS } from '@/utils/constants'

export const MobileDocuments: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Rejection Modal
  const [rejectItem, setRejectItem] = useState<Document | null>(null)
  const [rejectionRemarks, setRejectionRemarks] = useState('')

  // Fetch Documents
  const { data: documentsData, isLoading } = useQuery<PaginatedResponse<Document>>({
    queryKey: ['mobileAdminDocuments', page, statusFilter, categoryFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Document>>('/documents', {
        page,
        page_size: 15,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      }),
  })

  // Verify / Reject Mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      apiClient.post(`/documents/${id}/verify`, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminDocuments'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setRejectItem(null)
      setRejectionRemarks('')
    },
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDownload = (docId: string, filename: string) => {
    const token = localStorage.getItem('access_token')
    fetch(`/api/v1/documents/${docId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = link
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch((err) => console.error('Download error:', err))
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Document Verification</h1>
        <p className="text-xs text-slate-500">
          Underwrite and audit customer identity & income documents for bank submissions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Categories</option>
          {DOCUMENT_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !documentsData || documentsData.items.length === 0 ? (
        <EmptyState
          title="No documents in queue"
          description="Zero files match the current verification filter."
        />
      ) : (
        <div className="space-y-3">
          {documentsData.items.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[170px]" title={doc.file_name}>
                      {doc.file_name}
                    </h3>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {doc.category.replace('_', ' ')} • {formatFileSize(doc.file_size)}
                    </div>
                  </div>
                </div>
                <Badge status={doc.verification_status} />
              </div>

              <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{doc.customer_name || 'Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploaded by:</span>
                  <span className="text-slate-800">{doc.uploaded_by_name || 'Agent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-600 font-mono">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {doc.rejection_remarks && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <strong>Rejection Note:</strong> {doc.rejection_remarks}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(doc.id, doc.file_name)}
                  className="p-2 bg-slate-100 active:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </button>

                {doc.verification_status === 'pending' && (
                  <>
                    <button
                      disabled={verifyMutation.isPending}
                      onClick={() => setRejectItem(doc)}
                      className="flex-1 py-1.5 bg-rose-50 active:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      disabled={verifyMutation.isPending}
                      onClick={() =>
                        verifyMutation.mutate({
                          id: doc.id,
                          status: 'verified',
                        })
                      }
                      className="flex-1 py-1.5 bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Verify
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {documentsData.pages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={documentsData.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Reject Remarks Modal */}
      <Modal
        isOpen={!!rejectItem}
        onClose={() => setRejectItem(null)}
        title="Reject Document"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Specify why this document is rejected so the agent can inform the borrower:
          </p>
          <textarea
            rows={3}
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            placeholder="e.g. Salary slip blurry / missing employer stamp..."
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectItem(null)}
              className="px-3 py-1.5 border text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={verifyMutation.isPending || !rejectionRemarks.trim()}
              onClick={() => {
                if (rejectItem) {
                  verifyMutation.mutate({
                    id: rejectItem.id,
                    status: 'rejected',
                    remarks: rejectionRemarks.trim(),
                  })
                }
              }}
              className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
