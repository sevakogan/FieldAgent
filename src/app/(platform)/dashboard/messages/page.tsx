'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getConversations, type ConversationRow } from '@/lib/actions/messages'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getConversations()
    if (result.success && result.data) {
      setConversations(result.data)
    } else {
      setError(result.error ?? 'Failed to load messages')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = conversations.filter(c =>
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Messages</h1>
      </div>

      <input
        type="text"
        placeholder="Search conversations..."
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

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">No messages yet</h3>
          <p className="text-sm text-[#8E8E93]">Conversations with clients will appear here</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] divide-y divide-[#E5E5EA]">
          {filtered.map((conv) => (
            <Link
              key={conv.client_id}
              href={`/dashboard/messages/${conv.client_id}`}
              className="flex items-center gap-4 p-4 hover:bg-[#F2F2F7] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] font-semibold text-sm shrink-0">
                {conv.client_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1C1C1E] text-sm">{conv.client_name}</span>
                  <span className="text-xs text-[#8E8E93] shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                </div>
                <p className="text-sm text-[#8E8E93] truncate mt-0.5">{conv.last_message}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="bg-[#007AFF] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
