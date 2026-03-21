'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  createQuote,
  getClientOptions,
  getAddressOptions,
  type ClientOption,
  type AddressOption,
  type QuoteLineItem,
} from '@/lib/actions/quotes'

const EMPTY_LINE_ITEM: QuoteLineItem = { description: '', quantity: 1, unit_price: 0 }

export default function NewQuotePage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [addresses, setAddresses] = useState<AddressOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [addressId, setAddressId] = useState('')
  const [description, setDescription] = useState('')
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([{ ...EMPTY_LINE_ITEM }])
  const [taxAmount, setTaxAmount] = useState(0)
  const [validUntil, setValidUntil] = useState('')

  useEffect(() => {
    async function load() {
      const [clientResult, addressResult] = await Promise.all([
        getClientOptions(),
        getAddressOptions(),
      ])
      if (clientResult.success && clientResult.data) {
        setClients(clientResult.data)
      }
      if (addressResult.success && addressResult.data) {
        setAddresses(addressResult.data)
      }
    }
    load()
  }, [])

  const filteredAddresses = clientId
    ? addresses.filter((a) => a.client_id === clientId)
    : addresses

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )
  const total = subtotal + taxAmount

  function updateLineItem(index: number, field: keyof QuoteLineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { ...EMPTY_LINE_ITEM }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const result = await createQuote({
      client_id: clientId,
      address_id: addressId || undefined,
      title,
      description: description || undefined,
      line_items: lineItems.filter((item) => item.description.trim()),
      tax_amount: taxAmount,
      valid_until: validUntil || undefined,
    })

    if (result.success && result.data) {
      router.push(`/dashboard/quotes/${result.data.id}`)
    } else {
      setError(result.error ?? 'Failed to create quote')
      setSaving(false)
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div>
      <Link href="/dashboard/quotes" className="text-[#007AFF] text-sm mb-2 inline-block">
        &larr; Back to Quotes
      </Link>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">New Quote</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Basic info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
            >
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Quote Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8E8E93] mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    placeholder="e.g. Monthly Cleaning Quote"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-1">Client *</label>
                    <select
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value)
                        setAddressId('')
                      }}
                      required
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    >
                      <option value="">Select client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-1">Address</label>
                    <select
                      value={addressId}
                      onChange={(e) => setAddressId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    >
                      <option value="">No address</option>
                      {filteredAddresses.map((a) => (
                        <option key={a.id} value={a.id}>{a.display}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#8E8E93] mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
                    placeholder="Additional notes or description..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Line items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
            >
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Line Items</h2>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                        min={1}
                        placeholder="Qty"
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        value={item.unit_price || ''}
                        onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                        min={0}
                        step="0.01"
                        placeholder="Price"
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                    <div className="w-24 py-2 text-sm text-right font-medium text-[#1C1C1E]">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
                      disabled={lineItems.length <= 1}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="mt-3 text-sm text-[#007AFF] font-medium hover:underline"
              >
                + Add line item
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
            >
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Subtotal</span>
                  <span className="font-medium text-[#1C1C1E]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8E8E93]">Tax</span>
                  <input
                    type="number"
                    value={taxAmount || ''}
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    min={0}
                    step="0.01"
                    className="w-24 px-2 py-1 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div className="border-t border-[#E5E5EA] pt-3 flex justify-between">
                  <span className="font-semibold text-[#1C1C1E]">Total</span>
                  <span className="font-bold text-[#1C1C1E]">{formatCurrency(total)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
            >
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Settings</h2>
              <div>
                <label className="block text-sm text-[#8E8E93] mb-1">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>
            </motion.div>

            {error && (
              <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-xl p-3">
                <p className="text-sm text-[#FF6B6B]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
