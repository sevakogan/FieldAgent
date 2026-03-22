'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getQuotes, type QuoteRow } from '@/lib/actions/quotes'
import type { QuoteStatus } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  draft: '#8E8E93',
  sent: '#007AFF',
  accepted: '#34C759',
  declined: '#FF6B6B',
  expired: '#FF9F0A',
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await getQuotes({ status: activeTab })
      if (result.success && result.data) {
        setQuotes(result.data)
      }
      setLoading(false)
    }
    load()
  }, [activeTab])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Quotes</h1>
        <Link
          href="/dashboard/quotes/new"
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          + New Quote
        </Link>
      </div>

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
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#8E8E93] text-sm mb-2">No quotes yet</p>
            <Link
              href="/dashboard/quotes/new"
              className="text-[#007AFF] text-sm font-medium"
            >
              Create your first quote
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Title</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Client</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Valid Until</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {quotes.map((quote, i) => (
                <motion.tr
                  key={quote.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="p-4">
                    <Link
                      href={`/dashboard/quotes/${quote.id}`}
                      className="text-sm font-medium text-[#1C1C1E] hover:text-[#007AFF] transition-colors"
                    >
                      {quote.title || 'Untitled Quote'}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-[#3C3C43]">{quote.client_name}</td>
                  <td className="p-4 text-sm text-right font-medium text-[#1C1C1E]">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-2xl font-medium capitalize"
                      style={{
                        backgroundColor: (STATUS_COLORS[quote.status] ?? '#8E8E93') + '20',
                        color: STATUS_COLORS[quote.status] ?? '#8E8E93',
                      }}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {formatDate(quote.valid_until)}
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {formatDate(quote.created_at)}
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
