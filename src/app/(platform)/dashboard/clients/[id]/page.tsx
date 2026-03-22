'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClient, updateClient, deleteClient, getClientHistory, type ClientDetail, type ClientJob, type ClientInvoice } from '@/lib/actions/clients'
import { createAddress } from '@/lib/actions/addresses'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const PAYMENT_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  monthly: 'Monthly',
}

function getServiceIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('clean') || n.includes('turnover')) return '🧹'
  if (n.includes('pool')) return '🏊'
  if (n.includes('lawn') || n.includes('grass')) return '🌿'
  if (n.includes('plumb')) return '🔧'
  if (n.includes('handyman')) return '🛠️'
  if (n.includes('laundry') || n.includes('linen')) return '🧺'
  if (n.includes('inspect')) return '🔍'
  if (n.includes('deep')) return '✨'
  return '⚙️'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<ClientJob[]>([])
  const [historyTab, setHistoryTab] = useState<'jobs' | 'invoices'>('jobs')
  const [invoices, setInvoices] = useState<ClientInvoice[]>([])

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editPayment, setEditPayment] = useState('per_job')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Add Property state
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [propStreet, setPropStreet] = useState('')
  const [propUnit, setPropUnit] = useState('')
  const [propCity, setPropCity] = useState('')
  const [propState, setPropState] = useState('')
  const [propZip, setPropZip] = useState('')
  const [propIsStr, setPropIsStr] = useState(false)
  const [addingProp, setAddingProp] = useState(false)
  const [propError, setPropError] = useState<string | null>(null)

  const fetchClient = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [clientResult, historyResult] = await Promise.all([
      getClient(clientId),
      getClientHistory(clientId),
    ])
    if (clientResult.success && clientResult.data) {
      setClient(clientResult.data)
    } else {
      setError(clientResult.error ?? 'Failed to load client')
    }
    if (historyResult.success && historyResult.data) {
      setJobs(historyResult.data.jobs)
      setInvoices(historyResult.data.invoices)
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const totalRevenue = useMemo(
    () => invoices
      .filter(inv => inv.status === 'charged' || inv.status === 'completed')
      .reduce((sum, inv) => sum + inv.total, 0),
    [invoices],
  )

  const startEditing = () => {
    if (!client) return
    setEditName(client.full_name)
    setEditEmail(client.email)
    setEditPhone(client.phone ?? '')
    setEditPayment(client.payment_schedule)
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    const result = await updateClient(clientId, {
      full_name: editName,
      email: editEmail,
      phone: editPhone,
      payment_schedule: editPayment,
    })

    if (result.success) {
      setEditing(false)
      await fetchClient()
    } else {
      setSaveError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteClient(clientId)
    if (result.success) {
      router.push('/dashboard/clients')
    } else {
      setError(result.error ?? 'Failed to delete client')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleAddProperty = async () => {
    if (!propStreet.trim() || !propCity.trim() || !propState.trim() || !propZip.trim()) {
      setPropError('Street, city, state, and zip are required')
      return
    }
    setAddingProp(true)
    setPropError(null)

    const result = await createAddress({
      client_id: clientId,
      street: propStreet,
      unit: propUnit || undefined,
      city: propCity,
      state: propState,
      zip: propZip,
      is_str: propIsStr,
    })

    if (result.success) {
      setShowAddProperty(false)
      setPropStreet(''); setPropUnit(''); setPropCity(''); setPropState(''); setPropZip(''); setPropIsStr(false)
      await fetchClient()
    } else {
      setPropError(result.error ?? 'Failed to add property')
    }
    setAddingProp(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !client) {
    return (
      <div>
        <Link href="/dashboard/clients" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
          &larr; Back to Clients
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/clients" className="text-[#007AFF] text-sm mb-4 inline-flex items-center gap-1 hover:underline">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Clients
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {/* ── Hero Header Card ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-elevated rounded-2xl p-4 relative overflow-hidden"
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#007AFF] via-[#AF52DE] to-[#FF2D55]" />

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs">{saveError}</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#8E8E93] mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#8E8E93] mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#8E8E93] mb-1 font-medium">Phone</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#8E8E93] mb-1 font-medium">Payment Schedule</label>
                    <select
                      value={editPayment}
                      onChange={(e) => setEditPayment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    >
                      <option value="per_job">Per Job</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} loading={saving}>
                    Save Changes
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-[#1C1C1E] leading-tight">{client.full_name}</h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {client.email && (
                        <a href={`mailto:${client.email}`} className="text-xs text-[#007AFF] hover:underline truncate">
                          {client.email}
                        </a>
                      )}
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="text-xs text-[#8E8E93] hover:text-[#007AFF] transition-colors">
                          {client.phone}
                        </a>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/8 text-[#007AFF] font-medium">
                        {PAYMENT_LABELS[client.payment_schedule] ?? client.payment_schedule}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E8E93] mt-2">
                      Member since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      {client.auto_pay && <span className="ml-2 text-[#34C759]">Auto-Pay On</span>}
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#007AFF] to-[#AF52DE] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-[#007AFF]/20">
                    {getInitials(client.full_name)}
                  </div>
                </div>

                {/* Inline action icons */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#E5E5EA]/40">
                  <button
                    onClick={startEditing}
                    className="p-2 rounded-xl text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/8 transition-all"
                    title="Edit client"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 rounded-xl text-[#8E8E93] hover:text-[#34C759] hover:bg-[#34C759]/8 transition-all"
                      title="Call client"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </a>
                  )}
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="p-2 rounded-xl text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/8 transition-all"
                      title="Email client"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </a>
                  )}
                  <Link
                    href={`/dashboard/jobs/new?client=${clientId}`}
                    className="p-2 rounded-xl text-[#8E8E93] hover:text-[#AF52DE] hover:bg-[#AF52DE]/8 transition-all"
                    title="Schedule job"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </Link>

                  <div className="flex-1" />

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="p-2 rounded-xl text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/8 transition-all"
                      title="Delete client"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#FF3B30] font-medium">Delete permanently?</span>
                      <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting} loading={deleting}>
                        Yes
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                        No
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Quick Stats Row ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#007AFF]">{jobs.length}</p>
            <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wider">Total Jobs</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#34C759]">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wider">Revenue</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#AF52DE]">{client.addresses.length}</p>
            <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wider">Properties</p>
          </div>
        </motion.div>

        {/* ── Properties Section ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-3.5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1C1C1E]">
              Properties
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-lg bg-[#AF52DE]/10 text-[#AF52DE] font-semibold">
                {client.addresses.length}
              </span>
            </h2>
            <button
              onClick={() => setShowAddProperty(!showAddProperty)}
              className={`text-xs font-semibold transition-colors ${showAddProperty ? 'text-[#FF3B30]' : 'text-[#007AFF] hover:text-[#0055B3]'}`}
            >
              {showAddProperty ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {/* Add Property Form (inline expandable) */}
          <AnimatePresence>
            {showAddProperty && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-3 p-3 bg-[#F2F2F7]/80 rounded-xl space-y-2.5">
                  {propError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-xs">{propError}</div>
                  )}
                  <input
                    type="text"
                    placeholder="Street Address *"
                    value={propStreet}
                    onChange={e => setPropStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                  <input
                    type="text"
                    placeholder="Unit / Apt (optional)"
                    value={propUnit}
                    onChange={e => setPropUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City *" value={propCity} onChange={e => setPropCity(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                    <input type="text" placeholder="State *" value={propState} onChange={e => setPropState(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                    <input type="text" placeholder="ZIP *" value={propZip} onChange={e => setPropZip(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={propIsStr} onChange={e => setPropIsStr(e.target.checked)} className="w-4 h-4 rounded border-[#E5E5EA] text-[#FF9F0A] focus:ring-[#FF9F0A]/30" />
                    <span className="text-xs text-[#1C1C1E]">Short-Term Rental (STR)</span>
                  </label>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddProperty}
                    disabled={addingProp}
                    loading={addingProp}
                    className="w-full"
                    pill={false}
                  >
                    Add Property
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {client.addresses.length === 0 && !showAddProperty ? (
            <button
              onClick={() => setShowAddProperty(true)}
              className="w-full py-5 border-2 border-dashed border-[#C7C7CC] rounded-xl text-sm text-[#8E8E93] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
            >
              + Add first property
            </button>
          ) : (
            <div className="space-y-1.5">
              {client.addresses.map(addr => (
                <Link
                  key={addr.id}
                  href={`/dashboard/addresses/${addr.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F7]/60 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#007AFF]/8 flex items-center justify-center text-sm shrink-0">
                    📍
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1C1C1E] font-medium truncate group-hover:text-[#007AFF] transition-colors">
                      {addr.street}{addr.unit ? `, ${addr.unit}` : ''}
                    </p>
                    <p className="text-[10px] text-[#8E8E93]">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {addr.is_str && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#CC7F08] font-semibold">
                        STR
                      </span>
                    )}
                    <StatusBadge status={addr.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Job History + Invoices (Tabbed) ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Tab header */}
          <div className="flex border-b border-[#E5E5EA]/30">
            {[
              { key: 'jobs' as const, label: 'Job History', count: jobs.length },
              { key: 'invoices' as const, label: 'Invoices', count: invoices.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setHistoryTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-all relative ${
                  historyTab === tab.key
                    ? 'text-[#007AFF]'
                    : 'text-[#8E8E93] hover:text-[#3C3C43]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-lg ${
                    historyTab === tab.key ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-[#F2F2F7] text-[#8E8E93]'
                  }`}>{tab.count}</span>
                )}
                {historyTab === tab.key && (
                  <motion.div layoutId="clientTab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#007AFF] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3">
            <AnimatePresence mode="wait">
              {historyTab === 'jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                  {jobs.length === 0 ? (
                    <p className="text-xs text-[#8E8E93] text-center py-6">No jobs yet</p>
                  ) : (
                    <div className="space-y-1">
                      {jobs.map(job => (
                        <Link key={job.id} href={`/dashboard/jobs/${job.id}`}
                          className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-[#F2F2F7]/50 transition-colors group">
                          <div className="w-7 h-7 rounded-lg bg-[#007AFF]/8 flex items-center justify-center text-xs shrink-0">
                            {getServiceIcon(job.service_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#1C1C1E] font-medium truncate group-hover:text-[#007AFF] transition-colors">{job.service_name}</span>
                              <StatusBadge status={job.status} />
                            </div>
                            <p className="text-[10px] text-[#8E8E93] truncate">
                              {job.scheduled_date ? new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString() : 'Unscheduled'}
                              {' · '}{job.address_street}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-[#1C1C1E] shrink-0">${job.price.toFixed(2)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {historyTab === 'invoices' && (
                <motion.div key="invoices" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                  {invoices.length === 0 ? (
                    <p className="text-xs text-[#8E8E93] text-center py-6">No invoices yet</p>
                  ) : (
                    <div className="space-y-1">
                      {invoices.map(inv => (
                        <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                          className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-[#F2F2F7]/50 transition-colors group">
                          <div className="w-7 h-7 rounded-lg bg-[#34C759]/8 flex items-center justify-center text-xs shrink-0">
                            📄
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#1C1C1E] font-medium group-hover:text-[#007AFF] transition-colors">#{inv.invoice_number}</span>
                              <StatusBadge status={inv.status} />
                            </div>
                            <p className="text-[10px] text-[#8E8E93]">
                              {new Date(inv.created_at).toLocaleDateString()}
                              {inv.paid_at ? ` · Paid ${new Date(inv.paid_at).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-[#1C1C1E] shrink-0">${inv.total.toFixed(2)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
