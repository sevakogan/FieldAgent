'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  getInvoices,
  getInvoiceSummary,
  type InvoiceRow,
  type InvoiceSummary,
} from '@/lib/actions/invoices'

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9F0A',
  paid: '#34C759',
  failed: '#FF6B6B',
  refunded: '#8E8E93',
  overdue: '#FF3B30',
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Failed', value: 'failed' },
]

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [summary, setSummary] = useState<InvoiceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [invoicesResult, summaryResult] = await Promise.all([
        getInvoices({ status: activeTab }),
        getInvoiceSummary(),
      ])
      if (invoicesResult.success && invoicesResult.data) {
        setInvoices(invoicesResult.data)
      }
      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
      }
      setLoading(false)
    }
    load()
  }, [activeTab])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Invoices</h1>
        <Link
          href="/dashboard/jobs"
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          + Create from Job
        </Link>
      </div>

      {/* Summary banner */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
            <p className="text-sm text-[#8E8E93] mb-1">Potential Revenue</p>
            <p className="text-xl font-bold text-[#007AFF]">
              {formatCurrency(summary.potentialRevenue)}
            </p>
            <p className="text-[10px] text-[#C7C7CC] mt-0.5">From pending invoices</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
            <p className="text-sm text-[#8E8E93] mb-1">Outstanding</p>
            <p className="text-xl font-bold text-[#FF9F0A]">
              {formatCurrency(summary.totalOutstanding)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
            <p className="text-sm text-[#8E8E93] mb-1">Collected</p>
            <p className="text-xl font-bold text-[#34C759]">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
            <p className="text-sm text-[#8E8E93] mb-1">Overdue</p>
            <p className="text-xl font-bold text-[#FF3B30]">
              {formatCurrency(summary.totalOverdue)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-[#8E8E93] border border-[#E5E5EA] hover:bg-[#F2F2F7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="h-4 w-32 bg-[#F2F2F7] rounded animate-pulse mx-auto" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#8E8E93] text-sm">No invoices yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Invoice #</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Client</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Due Date</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {invoices.map((invoice, i) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="p-4">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-sm font-medium text-[#1C1C1E] hover:text-[#007AFF] transition-colors"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-[#3C3C43]">{invoice.client_name}</td>
                  <td className="p-4 text-sm text-right font-medium text-[#1C1C1E]">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-2xl font-medium capitalize"
                      style={{
                        backgroundColor: (STATUS_COLORS[invoice.status] ?? '#8E8E93') + '20',
                        color: STATUS_COLORS[invoice.status] ?? '#8E8E93',
                      }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {formatDate(invoice.created_at)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
