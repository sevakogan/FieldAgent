'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getClients, type ClientRow, type ClientAddress } from '@/lib/actions/clients'
import { Button } from '@/components/platform/Button'

const PAYMENT_LABELS: Record<string, string> = { per_job: 'Per Job', monthly: 'Monthly' }

// ── Phone Action ────────────────────────────────────────────────────
function PhoneLink({ phone }: { phone: string | null }) {
  if (!phone) return null
  return (
    <a href={`tel:${phone}`} className="text-xs text-[#007AFF] hover:underline flex items-center gap-1"
      onClick={e => e.stopPropagation()}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      {phone}
    </a>
  )
}

// ── Client Card ─────────────────────────────────────────────────────
function ClientCard({ client, index }: { client: ClientRow; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasNoAddress = client.addresses.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`glass rounded-2xl overflow-hidden transition-all ${
        hasNoAddress ? 'ring-1 ring-[#FF3B30]/20' : ''
      }`}
    >
      {/* Client row — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/40 transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {client.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1C1C1E] truncate">{client.full_name}</span>
            {hasNoAddress && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] font-semibold whitespace-nowrap">
                ⚠ No Property
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[#8E8E93] truncate">{client.email}</span>
            <PhoneLink phone={client.phone} />
          </div>
        </div>

        {/* Right side: property count + payment + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#8E8E93] uppercase">{PAYMENT_LABELS[client.payment_schedule] ?? client.payment_schedule}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
              client.addresses.length > 0
                ? 'bg-[#007AFF]/10 text-[#007AFF]'
                : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}>
              {client.addresses.length} {client.addresses.length === 1 ? 'prop' : 'props'}
            </span>
            <motion.svg
              className="w-4 h-4 text-[#AEAEB2]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </div>
        </div>
      </button>

      {/* Expanded: properties list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-[#E5E5EA]/50">
              {client.addresses.length === 0 ? (
                <div className="pt-3 text-center">
                  <p className="text-xs text-[#8E8E93] mb-2">No properties yet</p>
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Button variant="primary" size="sm">+ Add Property</Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-2 space-y-1.5">
                  {client.addresses.map((addr: ClientAddress) => (
                    <Link
                      key={addr.id}
                      href={`/dashboard/addresses/${addr.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F2F2F7]/60 hover:bg-[#E5E5EA]/60 transition-colors group/addr"
                    >
                      <svg className="w-4 h-4 text-[#8E8E93] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1C1C1E] truncate">
                          {addr.street}{addr.unit ? `, ${addr.unit}` : ''}
                        </p>
                        <p className="text-[10px] text-[#8E8E93]">{addr.city}, {addr.state} {addr.zip}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {addr.is_str && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-[#FF9F0A]/10 text-[#FF9F0A] font-semibold">STR</span>
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full ${addr.status === 'active' ? 'bg-[#34C759]' : 'bg-[#8E8E93]'}`} />
                        <svg className="w-3 h-3 text-[#C7C7CC] group-hover/addr:text-[#007AFF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  ))}

                  {/* Add property + view client actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link href={`/dashboard/clients/${client.id}`}
                      className="text-[10px] text-[#007AFF] font-semibold hover:underline">
                      + Add Property
                    </Link>
                    <span className="text-[#E5E5EA]">·</span>
                    <Link href={`/dashboard/clients/${client.id}`}
                      className="text-[10px] text-[#8E8E93] font-medium hover:text-[#007AFF] hover:underline transition-colors">
                      View Client →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  useEffect(() => { fetchClients() }, [fetchClients])

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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Clients & Properties</h1>
        <Link href="/dashboard/clients/new">
          <Button variant="primary" size="sm" icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Add Client
          </Button>
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2.5 glass rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && clients.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No clients yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Add your first client to get started.</p>
          <Link href="/dashboard/clients/new">
            <Button variant="primary">Add Your First Client</Button>
          </Link>
        </motion.div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="space-y-2">
          {filtered.map((client, i) => (
            <ClientCard key={client.id} client={client} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[#8E8E93]">
              No clients match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
