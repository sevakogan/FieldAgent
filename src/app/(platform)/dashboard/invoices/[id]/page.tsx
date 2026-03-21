'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  getInvoice,
  updateInvoiceStatus,
  markInvoiceSent,
  deleteInvoice,
  type InvoiceDetail,
} from '@/lib/actions/invoices'

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9F0A',
  paid: '#34C759',
  failed: '#FF6B6B',
  refunded: '#8E8E93',
  overdue: '#FF3B30',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const result = await getInvoice(id)
      if (result.success && result.data) {
        setInvoice(result.data)
      } else {
        setError(result.error ?? 'Invoice not found')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleMarkPaid() {
    setActionLoading(true)
    setError(null)
    const result = await updateInvoiceStatus(id, 'paid')
    if (result.success) {
      const refreshed = await getInvoice(id)
      if (refreshed.success && refreshed.data) {
        setInvoice(refreshed.data)
      }
    } else {
      setError(result.error ?? 'Failed to update status')
    }
    setActionLoading(false)
  }

  async function handleSend() {
    setActionLoading(true)
    setError(null)
    const result = await markInvoiceSent(id)
    if (result.success) {
      const refreshed = await getInvoice(id)
      if (refreshed.success && refreshed.data) {
        setInvoice(refreshed.data)
      }
    } else {
      setError(result.error ?? 'Failed to mark as sent')
    }
    setActionLoading(false)
  }

  async function handleDelete() {
    setActionLoading(true)
    const result = await deleteInvoice(id)
    if (result.success) {
      router.push('/dashboard/invoices')
    } else {
      setError(result.error ?? 'Failed to delete invoice')
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-4 w-24 bg-[#F2F2F7] rounded animate-pulse mb-4" />
        <div className="h-8 w-48 bg-[#F2F2F7] rounded animate-pulse mb-6" />
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 h-64 animate-pulse" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div>
        <Link href="/dashboard/invoices" className="text-[#007AFF] text-sm mb-4 inline-block">
          &larr; Back to Invoices
        </Link>
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-8 text-center">
          <p className="text-[#8E8E93]">{error ?? 'Invoice not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link href="/dashboard/invoices" className="text-[#007AFF] text-sm mb-2 inline-block">
        &larr; Back to Invoices
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">{invoice.invoice_number}</h1>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
          style={{
            backgroundColor: (STATUS_COLORS[invoice.status] ?? '#8E8E93') + '20',
            color: STATUS_COLORS[invoice.status] ?? '#8E8E93',
          }}
        >
          {invoice.status}
        </span>
      </div>

      {error && (
        <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-xl p-3 mb-4">
          <p className="text-sm text-[#FF6B6B]">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Invoice info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#8E8E93]">Client</p>
                <p className="text-[#1C1C1E] font-medium">{invoice.client_name}</p>
              </div>
              {invoice.client_email && (
                <div>
                  <p className="text-[#8E8E93]">Email</p>
                  <p className="text-[#1C1C1E] font-medium">{invoice.client_email}</p>
                </div>
              )}
              <div>
                <p className="text-[#8E8E93]">Due Date</p>
                <p className="text-[#1C1C1E] font-medium">{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-[#8E8E93]">Created</p>
                <p className="text-[#1C1C1E] font-medium">{formatDateTime(invoice.created_at)}</p>
              </div>
              {invoice.sent_at && (
                <div>
                  <p className="text-[#8E8E93]">Sent</p>
                  <p className="text-[#1C1C1E] font-medium">{formatDateTime(invoice.sent_at)}</p>
                </div>
              )}
              {invoice.paid_at && (
                <div>
                  <p className="text-[#8E8E93]">Paid</p>
                  <p className="text-[#34C759] font-medium">{formatDateTime(invoice.paid_at)}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Line items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Line Items</h2>
            {invoice.items.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">No line items</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E5EA]">
                    <th className="text-left pb-2 text-xs font-medium text-[#8E8E93] uppercase">Description</th>
                    <th className="text-center pb-2 text-xs font-medium text-[#8E8E93] uppercase w-20">Qty</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#8E8E93] uppercase w-28">Unit Price</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#8E8E93] uppercase w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 text-[#1C1C1E]">{item.description}</td>
                      <td className="py-3 text-center text-[#3C3C43]">{item.quantity}</td>
                      <td className="py-3 text-right text-[#3C3C43]">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-right font-medium text-[#1C1C1E]">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-[#E5E5EA] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8E8E93]">Subtotal</span>
                <span className="font-medium text-[#1C1C1E]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.expenses_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8E8E93]">Expenses</span>
                  <span className="text-[#1C1C1E]">{formatCurrency(invoice.expenses_total)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8E8E93]">Tax</span>
                  <span className="text-[#1C1C1E]">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.tip_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8E8E93]">Tip</span>
                  <span className="text-[#1C1C1E]">{formatCurrency(invoice.tip_amount)}</span>
                </div>
              )}
              {invoice.processing_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8E8E93]">Processing Fee</span>
                  <span className="text-[#1C1C1E]">{formatCurrency(invoice.processing_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-[#E5E5EA] pt-2">
                <span className="text-[#1C1C1E]">Total</span>
                <span className="text-[#1C1C1E]">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Actions</h2>
            <div className="space-y-2">
              {/* Mark as paid (only for pending/overdue) */}
              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                <button
                  onClick={handleMarkPaid}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-[#34C759] text-white rounded-xl text-sm font-medium hover:bg-[#2EB24E] transition-colors disabled:opacity-50"
                >
                  Mark as Paid
                </button>
              )}

              {/* Send (only if not yet sent) */}
              {!invoice.sent_at && invoice.status !== 'paid' && (
                <button
                  onClick={handleSend}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                >
                  Send Invoice
                </button>
              )}

              {/* Delete */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 bg-white text-[#FF6B6B] border border-[#FF6B6B] rounded-xl text-sm font-medium hover:bg-[#FF6B6B]/5 transition-colors"
                >
                  Delete Invoice
                </button>
              ) : (
                <div className="border border-[#FF6B6B]/30 rounded-xl p-3 space-y-2">
                  <p className="text-sm text-[#1C1C1E]">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-[#FF6B6B] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {actionLoading ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-[#F2F2F7] text-[#1C1C1E] rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
