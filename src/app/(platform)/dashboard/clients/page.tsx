'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getClients, updateClient, type ClientRow, type ClientAddress } from '@/lib/actions/clients'

const PAYMENT_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  monthly: 'Monthly',
}

// ── Address Hover Popup ──────────────────────────────────────────────
function AddressPopup({ addresses, clientId }: { addresses: ClientAddress[]; clientId: string }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  if (addresses.length === 0) {
    return (
      <Link
        href={`/dashboard/clients/${clientId}`}
        className="text-sm text-[#007AFF] hover:underline font-medium"
      >
        + Add
      </Link>
    )
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Link
        href={`/dashboard/clients/${clientId}`}
        className="text-sm text-[#007AFF] font-bold hover:underline cursor-pointer"
      >
        {addresses.length}
      </Link>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-3"
          >
            <div className="text-xs font-semibold text-[#8E8E93] uppercase mb-2">Properties</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {addresses.map(addr => (
                <Link
                  key={addr.id}
                  href={`/dashboard/addresses/${addr.id}`}
                  className="block p-2 rounded-xl hover:bg-[#F2F2F7] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {addr.street}{addr.unit ? `, ${addr.unit}` : ''}
                      </p>
                      <p className="text-xs text-[#8E8E93]">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {addr.is_str && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] font-semibold">
                          STR
                        </span>
                      )}
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: addr.status === 'active' ? '#34C759' : '#8E8E93' }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-[#E5E5EA] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Phone Button (click to dial) ─────────────────────────────────────
function PhoneButton({ phone }: { phone: string | null }) {
  const [showDialer, setShowDialer] = useState(false)

  if (!phone) return <span className="text-sm text-[#C7C7CC]">—</span>

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowDialer(!showDialer)
        }}
        className="text-sm text-[#007AFF] hover:underline font-medium flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {phone}
      </button>

      <AnimatePresence>
        {showDialer && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute z-50 top-full left-0 mt-2 bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-3 w-52"
          >
            <div className="text-xs font-semibold text-[#8E8E93] uppercase mb-2">Quick Actions</div>
            <div className="space-y-1">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F2F2F7] transition-colors text-sm text-[#1C1C1E]"
              >
                <span className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                Call
              </a>
              <a
                href={`sms:${phone}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F2F2F7] transition-colors text-sm text-[#1C1C1E]"
              >
                <span className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </span>
                Text
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(phone)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F2F2F7] transition-colors text-sm text-[#1C1C1E] w-full text-left"
              >
                <span className="w-8 h-8 rounded-full bg-[#8E8E93]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                Copy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Inline Edit Cell ─────────────────────────────────────────────────
function EditableCell({
  value,
  field,
  clientId,
  type = 'text',
  onSaved,
}: {
  value: string
  field: string
  clientId: string
  type?: 'text' | 'email' | 'select'
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if ('select' in inputRef.current) inputRef.current.select()
    }
  }, [editing])

  const handleSave = async () => {
    if (editValue === value) {
      setEditing(false)
      return
    }
    setSaving(true)
    const updateData: Record<string, string> = { [field]: editValue }
    await updateClient(clientId, updateData)
    setSaving(false)
    setEditing(false)
    onSaved()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditValue(value); setEditing(false) }
  }

  if (editing) {
    if (type === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          disabled={saving}
          className="px-2 py-1 bg-[#F2F2F7] border border-[#007AFF] rounded-lg text-sm focus:outline-none w-full max-w-[120px]"
        >
          <option value="per_job">Per Job</option>
          <option value="monthly">Monthly</option>
        </select>
      )
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className="px-2 py-1 bg-[#F2F2F7] border border-[#007AFF] rounded-lg text-sm focus:outline-none w-full max-w-[200px]"
      />
    )
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className="text-sm text-[#1C1C1E] cursor-text hover:bg-[#007AFF]/5 px-1 -mx-1 py-0.5 rounded transition-colors inline-block"
      title="Click to edit"
    >
      {type === 'select' ? (PAYMENT_LABELS[value] ?? value) : (value || '—')}
    </span>
  )
}

// ── Main Page ────────────────────────────────────────────────────────
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
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Name</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Phone</th>
                <th className="text-center p-4 text-xs font-medium text-[#8E8E93] uppercase">Properties</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Payment</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Created</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filtered.map((client, i) => {
                const hasNoAddress = client.addresses.length === 0
                return (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`transition-colors group ${hasNoAddress ? 'bg-[#FF3B30]/[0.03]' : 'hover:bg-[#F9F9FB]'}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={client.full_name}
                        field="full_name"
                        clientId={client.id}
                        onSaved={fetchClients}
                      />
                      {hasNoAddress && (
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] font-semibold whitespace-nowrap hover:bg-[#FF3B30]/20 transition-colors"
                        >
                          ⚠ No Property
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <EditableCell
                      value={client.email}
                      field="email"
                      clientId={client.id}
                      type="email"
                      onSaved={fetchClients}
                    />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <PhoneButton phone={client.phone} />
                  </td>
                  <td className="p-4 text-center">
                    <AddressPopup addresses={client.addresses} clientId={client.id} />
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <EditableCell
                      value={client.payment_schedule}
                      field="payment_schedule"
                      clientId={client.id}
                      type="select"
                      onSaved={fetchClients}
                    />
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden lg:table-cell">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-xs text-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </motion.tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[#8E8E93]">
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
