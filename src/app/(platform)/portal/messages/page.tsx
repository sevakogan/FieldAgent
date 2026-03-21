'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPortalConversations, getPortalProviders, sendPortalMessage } from '@/lib/actions/portal';
import type { PortalConversation, PortalProvider } from '@/lib/actions/portal';

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<PortalConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [providers, setProviders] = useState<PortalProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getPortalConversations().then(result => {
      setConversations(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, []);

  const handleOpenNewConvo = useCallback(async () => {
    const result = await getPortalProviders();
    if (result.success && result.data) {
      setProviders(result.data);
    }
    setShowNewConvo(true);
  }, []);

  const handleSendNew = useCallback(async () => {
    if (!selectedProvider || !newMessage.trim()) return;
    setSending(true);
    const result = await sendPortalMessage(selectedProvider, newMessage.trim());
    if (result.success) {
      setShowNewConvo(false);
      setNewMessage('');
      setSelectedProvider('');
      router.push(`/portal/messages/${selectedProvider}`);
    }
    setSending(false);
  }, [selectedProvider, newMessage, router]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={handleOpenNewConvo}
          className="flex items-center gap-1.5 rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#AF52DE]/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
      </div>

      {/* New Conversation Modal */}
      {showNewConvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">New Conversation</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#AF52DE] focus:outline-none"
                >
                  <option value="">Select a provider...</option>
                  {providers.map(p => (
                    <option key={p.companyId} value={p.companyId}>{p.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-[#AF52DE] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setShowNewConvo(false); setNewMessage(''); setSelectedProvider(''); }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNew}
                disabled={!selectedProvider || !newMessage.trim() || sending}
                className="flex-1 rounded-xl bg-[#AF52DE] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {conversations.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          conversations.map((thread) => (
            <Link
              key={thread.companyId}
              href={`/portal/messages/${thread.companyId}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
                {thread.companyName.substring(0, 2).toUpperCase()}
                {thread.unreadCount > 0 && (
                  <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#AF52DE] text-[10px] font-bold text-white">
                    {thread.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${thread.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {thread.companyName}
                  </h3>
                  <span className="shrink-0 text-xs text-gray-400">{formatTime(thread.lastMessageAt)}</span>
                </div>
                <p className={`truncate text-sm ${thread.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {thread.lastMessage}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
