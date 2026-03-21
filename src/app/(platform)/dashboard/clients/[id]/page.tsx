'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClient, updateClient, deleteClient, type ClientDetail } from '@/lib/actions/clients'
import { createAddress } from '@/lib/actions/addresses'

const PAYMENT_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  monthly: 'Monthly',
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const result = await getClient(clientId)
    if (result.success && result.data) {
      setClient(result.data)
    } else {
      setError(result.error ?? 'Failed to load client')
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

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
    <div>
      <Link href="/dashboard/clients" className="text-[#007AFF] text-sm mb-2 inline-block hover:underline">
        &larr; Back to Clients
      </Link>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">{client.full_name}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Client Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Client Information</h2>
              {!editing && (
                <button
                  onClick={startEditing}
                  className="text-sm text-[#007AFF] font-medium hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                    {saveError}
                  </div>
                )}
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Payment Schedule</label>
                  <select
                    value={editPayment}
                    onChange={(e) => setEditPayment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  >
                    <option value="per_job">Per Job</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0066DD] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-white text-[#1C1C1E] border border-[#E5E5EA] rounded-lg text-sm font-medium hover:bg-[#F2F2F7]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#8E8E93]">Name</p>
                  <p className="text-[#1C1C1E] font-medium">{client.full_name}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Email</p>
                  <p className="text-[#1C1C1E] font-medium">{client.email}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Phone</p>
                  <p className="text-[#1C1C1E] font-medium">{client.phone ?? '-'}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Payment Schedule</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {PAYMENT_LABELS[client.payment_schedule] ?? client.payment_schedule}
                  </p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Auto Pay</p>
                  <p className="text-[#1C1C1E] font-medium">{client.auto_pay ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Client Since</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">
                Properties ({client.addresses.length})
              </h2>
              <button
                onClick={() => setShowAddProperty(!showAddProperty)}
                className={`text-sm font-medium ${showAddProperty ? 'text-[#FF3B30]' : 'text-[#007AFF]'} hover:underline`}
              >
                {showAddProperty ? 'Cancel' : '+ Add Property'}
              </button>
            </div>

            {/* Add Property Form */}
            {showAddProperty && (
              <div className="mb-4 p-4 bg-[#F2F2F7] rounded-xl space-y-3">
                {propError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-xs">{propError}</div>
                )}
                <input type="text" placeholder="Street Address *" value={propStreet} onChange={e => setPropStreet(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                <input type="text" placeholder="Unit / Apt (optional)" value={propUnit} onChange={e => setPropUnit(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="City *" value={propCity} onChange={e => setPropCity(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                  <input type="text" placeholder="State *" value={propState} onChange={e => setPropState(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                  <input type="text" placeholder="ZIP *" value={propZip} onChange={e => setPropZip(e.target.value)} className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={propIsStr} onChange={e => setPropIsStr(e.target.checked)} className="w-4 h-4 rounded border-[#E5E5EA] text-[#FF9F0A] focus:ring-[#FF9F0A]/30" />
                  <span className="text-sm text-[#1C1C1E]">Short-Term Rental (STR)</span>
                </label>
                <button
                  onClick={handleAddProperty}
                  disabled={addingProp}
                  className="w-full py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                >
                  {addingProp ? 'Adding...' : 'Add Property'}
                </button>
              </div>
            )}

            {client.addresses.length === 0 && !showAddProperty ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#8E8E93] mb-2">No properties yet.</p>
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="text-sm text-[#007AFF] font-medium hover:underline"
                >
                  Add their first property
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5EA]">
                {client.addresses.map(addr => (
                  <Link
                    key={addr.id}
                    href={`/dashboard/addresses/${addr.id}`}
                    className="flex items-center justify-between py-3 hover:bg-[#F2F2F7] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm text-[#1C1C1E] font-medium">
                        {addr.street}{addr.unit ? `, ${addr.unit}` : ''}
                      </p>
                      <p className="text-xs text-[#8E8E93]">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {addr.is_str && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] font-medium">
                          STR
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: addr.status === 'active' ? '#34C75920' : '#8E8E9320',
                          color: addr.status === 'active' ? '#34C759' : '#8E8E93',
                        }}
                      >
                        {addr.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setShowAddProperty(true)}
                className="w-full py-2.5 bg-[#34C759] text-white rounded-xl text-sm font-medium hover:bg-[#2DB84D] transition-colors"
              >
                + Add Property
              </button>
              <Link
                href={`/dashboard/jobs/new?client=${clientId}`}
                className="w-full py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors block text-center"
              >
                + Schedule Job
              </Link>
              <button
                onClick={startEditing}
                className="w-full py-2.5 bg-white text-[#007AFF] border border-[#007AFF] rounded-xl text-sm font-medium hover:bg-[#007AFF]/5 transition-colors"
              >
                Edit Client
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 bg-white text-[#FF3B30] border border-[#FF3B30] rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Delete Client
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[#FF3B30] text-center">
                    This will permanently delete this client and all their addresses.
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-2.5 bg-[#FF3B30] text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full py-2.5 bg-white text-[#1C1C1E] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
