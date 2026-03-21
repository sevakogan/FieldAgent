'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getThreadMessages, sendMessage, markMessagesRead, type MessageRow } from '@/lib/actions/messages'

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
}

export default function MessageThreadPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getThreadMessages(clientId)
    if (result.success && result.data) {
      setMessages(result.data.messages)
      setClientName(result.data.clientName)
      await markMessagesRead(clientId)
    } else {
      setError(result.error ?? 'Failed to load messages')
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content || sending) return
    setSending(true)
    const result = await sendMessage(clientId, content)
    if (result.success) {
      setNewMessage('')
      await fetchData()
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupedByDate: { date: string; messages: MessageRow[] }[] = []
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toISOString().split('T')[0]
    const last = groupedByDate[groupedByDate.length - 1]
    if (last && last.date === dateKey) {
      last.messages.push(msg)
    } else {
      groupedByDate.push({ date: dateKey, messages: [msg] })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/messages" className="text-[#007AFF] hover:text-[#0066DD] text-sm font-medium">
          &larr; Back
        </Link>
        <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] font-semibold text-sm">
          {clientName.charAt(0).toUpperCase() || '?'}
        </div>
        <h1 className="text-lg font-bold text-[#1C1C1E]">{clientName || 'Conversation'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F2F2F7] rounded-2xl p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8E8E93]">No messages yet. Start the conversation below.</p>
          </div>
        )}

        {groupedByDate.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            <div className="flex items-center justify-center my-3">
              <span className="text-xs text-[#8E8E93] bg-white/80 px-3 py-1 rounded-full">
                {formatDate(dayMsgs[0].created_at)}
              </span>
            </div>
            {dayMsgs.map((msg) => {
              const isCompany = msg.sender_role !== 'client'
              return (
                <div key={msg.id} className={`flex mb-2 ${isCompany ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      isCompany
                        ? 'bg-[#007AFF] text-white rounded-br-md'
                        : 'bg-white text-[#1C1C1E] rounded-bl-md border border-[#E5E5EA]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isCompany ? 'text-white/60' : 'text-[#8E8E93]'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 mt-3">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
