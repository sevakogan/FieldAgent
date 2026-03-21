'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getAddresses, createAddress, type AddressRow } from '@/lib/actions/addresses'
import { getClients, type ClientRow } from '@/lib/actions/clients'

const STATUS_COLORS: Record<string, string> = {
  active: '#34C759',
  inactive: '#8E8E93',
}

function AddressesContent() {
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get('client')

  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Add address modal state
  const [showModal, setShowModal] = useState(!!preselectedClientId)
  const [formClientId, setFormClientId] = useState(preselectedClientId ?? '')
  const [formStreet, setFormStreet] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formState, setFormState] = useState('')
  const [formZip, setFormZip] = useState('')
  const [formIsStr, setFormIsStr] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [addrResult, clientResult] = await Promise.all([
      getAddresses(),
      getClients(),
    ])

    if (addrResult.success && addrResult.data) {
      setAddresses(addrResult.data)
    } else {
      setError(addrResult.error ?? 'Failed to load addresses')
    }

    if (clientResult.success && clientResult.data) {
      setClients(clientResult.data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = addresses.filter(a => {
    const q = search.toLowerCase()
    const fullAddress = `${a.street} ${a.unit ?? ''} ${a.city} ${a.state} ${a.zip}`.toLowerCase()
    return fullAddress.includes(q) || a.client_name.toLowerCase().includes(q)
  })

  const resetForm = () => {
    setFormClientId(preselectedClientId ?? '')
    setFormStreet('')
    setFormUnit('')
    setFormCity('')
    setFormState('')
    setFormZip('')
    setFormIsStr(false)
    setFormError(null)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formClientId) {
      setFormError('Please select a client')
      return
    }

    setSubmitting(true)
    const result = await createAddress({
      client_id: formClientId,
      street: formStreet,
      unit: formUnit || undefined,
      city: formCity,
      state: formState,
      zip: formZip,
      is_str: formIsStr,
    })

    if (result.success) {
      setShowModal(false)
      resetForm()
      await fetchData()
    } else {
      setFormError(result.error ?? 'Failed to create address')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Addresses</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          + Add Address
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by address or client name..."
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && addresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center"
        >
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No addresses yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Add a property to start scheduling services.</p>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="inline-block px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            Add Your First Address
          </button>
        </motion.div>
      )}

      {!loading && !error && addresses.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Address</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Client</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Type</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filtered.map((addr, i) => (
                <motion.tr
                  key={addr.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#F2F2F7] cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <Link href={`/dashboard/addresses/${addr.id}`} className="hover:text-[#007AFF]">
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {addr.street}{addr.unit ? `, ${addr.unit}` : ''}
                      </p>
                      <p className="text-xs text-[#8E8E93]">{addr.city}, {addr.state} {addr.zip}</p>
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    <Link href={`/dashboard/clients/${addr.client_id}`} className="hover:text-[#007AFF]">
                      {addr.client_name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: addr.is_str ? '#FF9F0A20' : '#007AFF20',
                        color: addr.is_str ? '#FF9F0A' : '#007AFF',
                      }}
                    >
                      {addr.is_str ? 'STR' : 'Residential'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: (STATUS_COLORS[addr.status] ?? '#8E8E93') + '20',
                        color: STATUS_COLORS[addr.status] ?? '#8E8E93',
                      }}
                    >
                      {addr.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden lg:table-cell">
                    {new Date(addr.created_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[#8E8E93]">
                    No addresses match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Add New Address</h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-[#8E8E93] mt-1">
                    No clients yet.{' '}
                    <Link href="/dashboard/clients/new" className="text-[#007AFF] hover:underline">
                      Create one first
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Unit</label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="Apt 4B"
                  className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Miami"
                    className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="FL"
                    maxLength={2}
                    className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                    ZIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formZip}
                    onChange={(e) => setFormZip(e.target.value)}
                    placeholder="33101"
                    maxLength={10}
                    className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isStr"
                  checked={formIsStr}
                  onChange={(e) => setFormIsStr(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E5E5EA] text-[#007AFF] focus:ring-[#007AFF]/30"
                />
                <label htmlFor="isStr" className="text-sm text-[#1C1C1E]">
                  Short-Term Rental (STR)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-white text-[#1C1C1E] border border-[#E5E5EA] rounded-xl text-sm font-medium text-center hover:bg-[#F2F2F7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function AddressesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8E8E93]">Loading...</div>}>
      <AddressesContent />
    </Suspense>
  )
}
