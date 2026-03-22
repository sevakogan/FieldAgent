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
}

const RECURRENCE_OPTIONS = ['one_time', 'weekly', 'biweekly', 'monthly'] as const

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
    setAddSvcRecurrence('one_time')
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

      <div className="grid md:grid-cols-[1fr_200px] gap-4">
        {/* Left column */}
        <div className="space-y-4">
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
              <div className="flex gap-4">
                {/* Left half: address info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[#1C1C1E] text-sm mb-2">Address Details</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wide">Full Address</p>
                      <p className="text-[#1C1C1E] font-medium text-xs">{fullAddress}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-[#8E8E93] uppercase tracking-wide">Client</p>
                        <Link
                          href={`/dashboard/clients/${address.client_id}`}
                          className="text-[#007AFF] font-medium text-xs hover:underline"
                        >
                          {address.client_name}
                        </Link>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8E8E93] uppercase tracking-wide">Type</p>
                        <StatusBadge status={address.is_str ? 'str' : 'residential'} />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8E8E93] uppercase tracking-wide">Status</p>
                        <StatusBadge status={address.status} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right half: map placeholder */}
                <div className="shrink-0">
                  <div className="h-32 w-32 bg-[#F2F2F7] rounded-xl flex items-center justify-center">
                    <p className="text-[10px] text-[#8E8E93] text-center px-2">
                      {address.lat && address.lng
                        ? `${address.lat.toFixed(4)}, ${address.lng.toFixed(4)}`
                        : 'Map coming soon'}
                    </p>
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
              <div className="text-center py-6">
                <p className="text-sm text-[#8E8E93] mb-3">
                  No services yet. Add a service to start scheduling jobs.
                </p>
                <Button variant="primary" size="sm" onClick={openAddService}>
                  + Add Service
                </Button>
              </div>
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
                    <div className="space-y-1.5">
                      {availableServices.length === 0 ? (
                        <p className="text-xs text-[#8E8E93] py-2">All services already assigned</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {availableServices.map(svc => (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => handleServiceTypeChange(svc.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                                addSvcTypeId === svc.id
                                  ? 'bg-[#007AFF]/10 border-[#007AFF] border ring-1 ring-[#007AFF]/20'
                                  : 'bg-[#F2F2F7]/60 border border-transparent hover:bg-[#E5E5EA]/60'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                addSvcTypeId === svc.id ? 'border-[#007AFF]' : 'border-[#C7C7CC]'
                              }`}>
                                {addSvcTypeId === svc.id && <span className="w-2 h-2 rounded-full bg-[#007AFF]" />}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#1C1C1E] truncate">{svc.name}</p>
                                <p className="text-[10px] text-[#8E8E93]">${Number(svc.default_price).toFixed(2)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
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
                    <div className="flex gap-1.5 flex-wrap">
                      {RECURRENCE_OPTIONS.map(opt => (
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

        {/* Right column: Quick Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-3.5"
          >
            <h2 className="font-semibold text-[#1C1C1E] text-sm mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={startEditing}
                className="w-full"
              >
                Edit Address
              </Button>
              <Link
                href={`/dashboard/clients/${address.client_id}`}
                className="block w-full py-2 bg-white/60 text-[#007AFF] border border-[#007AFF]/30 rounded-xl text-xs font-medium text-center hover:bg-[#007AFF]/5 transition-colors"
              >
                View Client
              </Link>
              {!confirmDelete ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full"
                >
                  Delete Address
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-[#FF3B30] text-center">
                    This will permanently delete this address.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    loading={deleting}
                    className="w-full"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
