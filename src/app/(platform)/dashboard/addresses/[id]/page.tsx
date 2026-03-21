'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAddress, updateAddress, deleteAddress, type AddressDetail } from '@/lib/actions/addresses'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const RECURRENCE_LABELS: Record<string, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
}

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
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">{address.street}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Address Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Address Details</h2>
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
                  <label className="block text-xs text-[#8E8E93] mb-1">Street</label>
                  <input
                    type="text"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Unit</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      maxLength={2}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">ZIP</label>
                    <input
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      maxLength={10}
                      className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
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
                      className="px-2 py-1 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none"
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
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-[#8E8E93]">Full Address</p>
                  <p className="text-[#1C1C1E] font-medium">{fullAddress}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Client</p>
                  <Link
                    href={`/dashboard/clients/${address.client_id}`}
                    className="text-[#007AFF] font-medium hover:underline"
                  >
                    {address.client_name}
                  </Link>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Type</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {address.is_str ? 'Short-Term Rental (STR)' : 'Residential'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Status</p>
                  <StatusBadge status={address.status} />
                </div>
                {address.integration_source && (
                  <div>
                    <p className="text-[#8E8E93]">Integration</p>
                    <p className="text-[#1C1C1E] font-medium capitalize">{address.integration_source}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#8E8E93]">Created</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {new Date(address.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-3">Location</h2>
            <div className="h-48 bg-[#F2F2F7] rounded-xl flex items-center justify-center">
              <p className="text-sm text-[#8E8E93]">
                {address.lat && address.lng
                  ? `${address.lat}, ${address.lng}`
                  : 'Map view coming soon'}
              </p>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">
              Services ({address.services.length})
            </h2>

            {address.services.length === 0 ? (
              <p className="text-sm text-[#8E8E93] py-4 text-center">No services assigned to this address.</p>
            ) : (
              <div className="divide-y divide-[#E5E5EA]">
                {address.services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm text-[#1C1C1E] font-medium">{svc.service_name}</p>
                      <p className="text-xs text-[#8E8E93]">
                        {RECURRENCE_LABELS[svc.recurrence] ?? svc.recurrence}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#1C1C1E]">
                        ${svc.price.toFixed(2)}
                      </span>
                      <StatusBadge status={svc.status} />
                    </div>
                  </div>
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
              <Button
                variant="primary"
                onClick={startEditing}
                className="w-full"
              >
                Edit Address
              </Button>
              <Link
                href={`/dashboard/clients/${address.client_id}`}
                className="block w-full py-2.5 bg-white text-[#007AFF] border border-[#007AFF] rounded-xl text-sm font-medium text-center hover:bg-[#007AFF]/5 transition-colors"
              >
                View Client
              </Link>
              {!confirmDelete ? (
                <Button
                  variant="danger"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full"
                >
                  Delete Address
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[#FF3B30] text-center">
                    This will permanently delete this address.
                  </p>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={deleting}
                    loading={deleting}
                    className="w-full"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="secondary"
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
