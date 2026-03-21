'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getClients, type ClientRow } from '@/lib/actions/clients'

const PAYMENT_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  monthly: 'Monthly',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getClients()
    if (result.success && result.data) {
      setClients(result.data)
    } else {
      setError(result.error ?? 'Failed to load clients')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          + Add Client
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center"
        >
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No clients yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Add your first client to get started.</p>
          <Link
            href="/dashboard/clients/new"
            className="inline-block px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            Add Your First Client
          </Link>
        </motion.div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Name</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Phone</th>
                <th className="text-center p-4 text-xs font-medium text-[#8E8E93] uppercase">Properties</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Payment</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filtered.map((client, i) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#F2F2F7] cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <Link href={`/dashboard/clients/${client.id}`} className="text-sm font-medium text-[#1C1C1E] hover:text-[#007AFF]">
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">{client.email}</td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden lg:table-cell">{client.phone ?? '-'}</td>
                  <td className="p-4 text-sm text-center text-[#1C1C1E] font-medium">{client.address_count}</td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {PAYMENT_LABELS[client.payment_schedule] ?? client.payment_schedule}
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden lg:table-cell">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[#8E8E93]">
                    No clients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
