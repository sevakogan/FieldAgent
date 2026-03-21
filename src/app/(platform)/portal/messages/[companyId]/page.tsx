'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPortalThread, sendPortalMessage, getPortalClient } from '@/lib/actions/portal';
import type { PortalMessage } from '@/lib/actions/portal';

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function ChatPage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [companyName, setCompanyName] = useState('');
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [clientUserId, setClientUserId] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getPortalThread(companyId),
      getPortalClient(),
    ]).then(([threadResult, clientResult]) => {
      if (threadResult.success && threadResult.data) {
        setCompanyName(threadResult.data.companyName);
        setMessages(threadResult.data.messages);
      }
      if (clientResult.success && clientResult.data) {
        setClientUserId(clientResult.data.userId);
      }
      setLoading(false);
    });
  }, [companyId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const tempMsg: PortalMessage = {
      id: `temp-${Date.now()}`,
      senderId: clientUserId,
      senderRole: 'client',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const result = await sendPortalMessage(companyId, text);
    if (result.success && result.data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, id: result.data!.id } : m));
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col md:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <Link href="/portal/messages" className="rounded-lg p-2 hover:bg-[#F2F2F7]">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
          {companyName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">{companyName}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isUser = msg.senderRole === 'client';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isUser ? 'bg-[#AF52DE] text-white' : 'bg-white text-gray-900 shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`mt-1 text-right text-[10px] ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl bg-white shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#AF52DE] text-white transition-opacity disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
