'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAddress,
  updateAddress,
  deleteAddress,
  addServiceToAddress,
  removeServiceFromAddress,
  type AddressDetail,
} from '@/lib/actions/addresses'
import { getServices, type ServiceRow } from '@/lib/actions/services'
import { getTeamMembers, type TeamMemberRow } from '@/lib/actions/team'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const RECURRENCE_LABELS: Record<string, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  per_turn: 'Per Turn',
}

const RECURRENCE_OPTIONS_REGULAR = ['one_time', 'weekly', 'biweekly', 'monthly'] as const
const RECURRENCE_OPTIONS_STR = ['per_turn', 'one_time'] as const

export default function AddressDetailPage() {
  const params = useParams()
  const router = useRouter()
  const addressId = params.id as string

  const [address, setAddress] = useState<AddressDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editStreet, setEditStreet] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editState, setEditState] = useState('')
  const [editZip, setEditZip] = useState('')
  const [editIsStr, setEditIsStr] = useState(false)
  const [editStatus, setEditStatus] = useState('active')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Add service state
  const [showAddService, setShowAddService] = useState(false)
  const [availableServices, setAvailableServices] = useState<ServiceRow[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([])
  const [addSvcTypeId, setAddSvcTypeId] = useState('')
  const [addSvcPrice, setAddSvcPrice] = useState('')
  const [addSvcRecurrence, setAddSvcRecurrence] = useState<string>('one_time')
  const [addSvcWorkerId, setAddSvcWorkerId] = useState('')
  const [addingSvc, setAddingSvc] = useState(false)
  const [addSvcError, setAddSvcError] = useState<string | null>(null)
  const [removingSvcId, setRemovingSvcId] = useState<string | null>(null)

  const fetchAddress = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getAddress(addressId)
    if (result.success && result.data) {
      setAddress(result.data)
    } else {
      setError(result.error ?? 'Failed to load address')
    }
    setLoading(false)
  }, [addressId])

  useEffect(() => {
    fetchAddress()
  }, [fetchAddress])

  const startEditing = () => {
    if (!address) return
    setEditStreet(address.street)
    setEditUnit(address.unit ?? '')
    setEditCity(address.city)
    setEditState(address.state)
    setEditZip(address.zip)
    setEditIsStr(address.is_str)
    setEditStatus(address.status)
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    const result = await updateAddress(addressId, {
      street: editStreet,
      unit: editUnit,
      city: editCity,
      state: editState,
      zip: editZip,
      is_str: editIsStr,
      status: editStatus,
    })

    if (result.success) {
      setEditing(false)
      await fetchAddress()
    } else {
      setSaveError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteAddress(addressId)
    if (result.success) {
      router.push('/dashboard/addresses')
    } else {
      setError(result.error ?? 'Failed to delete address')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const openAddService = async () => {
    setShowAddService(true)
    setAddSvcError(null)
    setAddSvcTypeId('')
    setAddSvcPrice('')
    setAddSvcRecurrence(address?.is_str ? 'per_turn' : 'one_time')
    setAddSvcWorkerId('')

    const [servicesResult, teamResult] = await Promise.all([
      getServices(),
      getTeamMembers(),
    ])

    if (servicesResult.success && servicesResult.data) {
      setAvailableServices(servicesResult.data)
    }
    if (teamResult.success && teamResult.data) {
      setTeamMembers(teamResult.data)
    }
  }

  const handleServiceTypeChange = (serviceTypeId: string) => {
    setAddSvcTypeId(serviceTypeId)
    const selected = availableServices.find(s => s.id === serviceTypeId)
    if (selected) {
      setAddSvcPrice(String(selected.default_price))
    }
  }

  const handleAddService = async () => {
    setAddSvcError(null)

    if (!addSvcTypeId) {
      setAddSvcError('Please select a service')
      return
    }

    const price = parseFloat(addSvcPrice)
    if (isNaN(price) || price < 0) {
      setAddSvcError('Please enter a valid price')
      return
    }

    setAddingSvc(true)

    const result = await addServiceToAddress({
      address_id: addressId,
      service_type_id: addSvcTypeId,
      price,
      recurrence: addSvcRecurrence,
      assigned_worker_id: addSvcWorkerId || undefined,
    })

    if (result.success) {
      setShowAddService(false)
      await fetchAddress()
    } else {
      setAddSvcError(result.error ?? 'Failed to add service')
    }

    setAddingSvc(false)
  }

  const handleRemoveService = async (addressServiceId: string) => {
    setRemovingSvcId(addressServiceId)
    const result = await removeServiceFromAddress(addressServiceId)
    if (result.success) {
      await fetchAddress()
    } else {
      setError(result.error ?? 'Failed to remove service')
    }
    setRemovingSvcId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !address) {
    return (
      <div>
        <Link href="/dashboard/addresses" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
          &larr; Back to Addresses
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  if (!address) return null

  const fullAddress = `${address.street}${address.unit ? `, ${address.unit}` : ''}, ${address.city}, ${address.state} ${address.zip}`

  return (
    <div>
      <Link href="/dashboard/addresses" className="text-[#007AFF] text-sm mb-2 inline-block hover:underline">
        &larr; Back to Addresses
      </Link>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-4">{address.street}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="max-w-3xl space-y-4">
          {/* Top card: Address details + map side by side */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-3.5"
          >
            {editing ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-[#1C1C1E] text-sm">Edit Address</h2>
                </div>
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-3">
                    {saveError}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Street</label>
                    <input
                      type="text"
                      value={editStreet}
                      onChange={(e) => setEditStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Unit</label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[#8E8E93] mb-1">City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8E8E93] mb-1">State</label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        maxLength={2}
                        className="w-full px-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8E8E93] mb-1">ZIP</label>
                      <input
                        type="text"
                        value={editZip}
                        onChange={(e) => setEditZip(e.target.value)}
                        maxLength={10}
                        className="w-full px-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editIsStr"
                        checked={editIsStr}
                        onChange={(e) => setEditIsStr(e.target.checked)}
                        className="h-4 w-4 rounded border-[#E5E5EA] text-[#007AFF]"
                      />
                      <label htmlFor="editIsStr" className="text-sm text-[#1C1C1E]">Short-Term Rental</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#8E8E93]">Status:</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="px-2 py-1 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      loading={saving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Header with actions */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-[#8E8E93]">{fullAddress}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Link href={`/dashboard/clients/${address.client_id}`}
                        className="text-xs text-[#007AFF] font-medium hover:underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {address.client_name}
                      </Link>
                      {address.is_str && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-[#FF9F0A]/10 text-[#FF9F0A] font-semibold">STR</span>
                      )}
                      <StatusBadge status={address.status} />
                    </div>
                  </div>
                  {/* Icon action buttons */}
                  <div className="flex items-center gap-1">
                    <button onClick={startEditing} title="Edit"
                      className="w-7 h-7 rounded-lg hover:bg-[#007AFF]/8 flex items-center justify-center transition-colors">
                      <svg className="w-3.5 h-3.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {!confirmDelete ? (
                      <button onClick={() => setConfirmDelete(true)} title="Delete"
                        className="w-7 h-7 rounded-lg hover:bg-[#FF3B30]/8 flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-[#FF3B30]/5 rounded-lg px-2 py-1">
                        <button onClick={handleDelete} disabled={deleting}
                          className="text-[10px] text-[#FF3B30] font-bold hover:underline disabled:opacity-50">
                          {deleting ? '...' : 'Confirm'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)}
                          className="text-[10px] text-[#8E8E93] hover:underline ml-1">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Services card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl p-3.5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1C1C1E] text-sm">
                Services ({address.services.length})
              </h2>
              {!showAddService && (
                <Button variant="primary" size="sm" onClick={openAddService}>
                  + Add Service
                </Button>
              )}
            </div>

            {address.services.length === 0 && !showAddService && (
              <button
                onClick={openAddService}
                className="w-full py-4 text-center rounded-xl border-2 border-dashed border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#007AFF]/3 transition-colors group"
              >
                <p className="text-xs text-[#8E8E93] group-hover:text-[#007AFF] transition-colors">
                  + Add a service to start scheduling jobs
                </p>
              </button>
            )}

            {address.services.length > 0 && (
              <div className="divide-y divide-[#E5E5EA]/50">
                {address.services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-[#1C1C1E] font-medium truncate">{svc.service_name}</span>
                      <span className="text-[10px] bg-[#F2F2F7] text-[#8E8E93] px-1.5 py-0.5 rounded-lg whitespace-nowrap">
                        {RECURRENCE_LABELS[svc.recurrence] ?? svc.recurrence}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium text-[#1C1C1E]">
                        ${svc.price.toFixed(2)}
                      </span>
                      <StatusBadge status={svc.status} />
                      <button
                        onClick={() => handleRemoveService(svc.id)}
                        disabled={removingSvcId === svc.id}
                        className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF3B30]/10 text-[#8E8E93] hover:text-[#FF3B30]"
                        aria-label="Remove service"
                      >
                        {removingSvcId === svc.id ? (
                          <div className="h-3 w-3 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add service inline form */}
            {showAddService && (
              <div className="mt-3 pt-3 border-t border-[#E5E5EA]/50">
                {addSvcError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-2.5 text-xs mb-3">
                    {addSvcError}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Service Type</label>
                    <div className="flex flex-wrap gap-1">
                      {availableServices.length === 0 ? (
                        <p className="text-[10px] text-[#8E8E93] py-1">All services assigned</p>
                      ) : (
                        availableServices.map(svc => (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => handleServiceTypeChange(svc.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] transition-all ${
                              addSvcTypeId === svc.id
                                ? 'bg-[#007AFF] text-white font-semibold shadow-sm'
                                : 'bg-[#F2F2F7]/80 text-[#3C3C43] hover:bg-[#E5E5EA]'
                            }`}
                          >
                            {svc.name} <span className="opacity-60">${Number(svc.default_price).toFixed(0)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addSvcPrice}
                        onChange={(e) => setAddSvcPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 bg-white/60 border border-[#E5E5EA]/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Recurrence</label>
                    {address.is_str && !address.integration_source && (
                      <div className="bg-[#FF9F0A]/8 text-[#CC7F08] text-xs rounded-xl px-3 py-2 mb-2">
                        Connect an integration (Airbnb, VRBO) for automatic scheduling from reservations
                      </div>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {(address.is_str ? RECURRENCE_OPTIONS_STR : RECURRENCE_OPTIONS_REGULAR).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAddSvcRecurrence(opt)}
                          className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                            addSvcRecurrence === opt
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E5E5EA]'
                          }`}
                        >
                          {RECURRENCE_LABELS[opt]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Assign Worker (optional)</label>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAddSvcWorkerId('')}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all ${
                          addSvcWorkerId === ''
                            ? 'bg-[#8E8E93]/15 text-[#1C1C1E] font-medium'
                            : 'bg-[#F2F2F7]/60 text-[#8E8E93] hover:bg-[#E5E5EA]/60'
                        }`}
                      >
                        Unassigned
                      </button>
                      {teamMembers.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAddSvcWorkerId(m.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all ${
                            addSvcWorkerId === m.id
                              ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium ring-1 ring-[#007AFF]/20'
                              : 'bg-[#F2F2F7]/60 text-[#3C3C43] hover:bg-[#E5E5EA]/60'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {m.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                          {m.full_name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddService}
                      disabled={addingSvc}
                      loading={addingSvc}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAddService(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
      </div>
    </div>
  )
}
