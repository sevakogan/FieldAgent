'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getNotificationPreferences, updateNotificationPreferences, type NotificationPref } from '@/lib/actions/company'

const TYPE_LABELS: Record<string, string> = {
  new_job: 'New Job Request',
  job_completed: 'Job Completed',
  job_cancelled: 'Job Cancelled',
  new_message: 'New Message',
  new_review: 'New Review',
  payment_received: 'Payment Received',
  invoice_overdue: 'Invoice Overdue',
  worker_arrived: 'Worker Arrived',
}

const CHANNELS = ['email', 'sms', 'push', 'in_app'] as const
const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  in_app: 'In-App',
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPref[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getNotificationPreferences()
    if (result.success && result.data) {
      setPrefs(result.data)
    } else {
      setError(result.error ?? 'Failed to load preferences')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const togglePref = (type: string, channel: typeof CHANNELS[number]) => {
    setPrefs(prev =>
      prev.map(p =>
        p.type === type ? { ...p, [channel]: !p[channel] } : p
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateNotificationPreferences(
      prefs.map(p => ({
        type: p.type,
        email: p.email,
        sms: p.sms,
        push: p.push,
        in_app: p.in_app,
      }))
    )
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/settings" className="text-[#007AFF] hover:text-[#0066DD] text-sm font-medium">
          &larr; Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Notifications</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">Notification preferences saved</div>
      )}

      {!loading && prefs.length > 0 && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5EA]">
                  <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Notification Type</th>
                  {CHANNELS.map((ch) => (
                    <th key={ch} className="text-center p-4 text-xs font-medium text-[#8E8E93] uppercase">
                      {CHANNEL_LABELS[ch]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prefs.map((pref) => (
                  <tr key={pref.type} className="border-b border-[#E5E5EA] last:border-0">
                    <td className="p-4 text-sm font-medium text-[#1C1C1E]">
                      {TYPE_LABELS[pref.type] ?? pref.type}
                    </td>
                    {CHANNELS.map((ch) => (
                      <td key={ch} className="p-4 text-center">
                        <button
                          onClick={() => togglePref(pref.type, ch)}
                          className={`w-10 h-6 rounded-full relative transition-colors ${
                            pref[ch] ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              pref[ch] ? 'left-[18px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  )
}
