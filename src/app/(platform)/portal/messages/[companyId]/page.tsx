'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const MOCK_CONVERSATIONS: Record<string, {
  companyName: string;
  avatar: string;
  messages: Array<{ id: string; text: string; sender: 'user' | 'company'; timestamp: string }>;
}> = {
  'prov-1': {
    companyName: 'SparkleClean Co.',
    avatar: 'SC',
    messages: [
      { id: 'm1', text: 'Hi! I\'d like to schedule a deep clean for this Saturday.', sender: 'user', timestamp: '2026-03-19T09:00:00' },
      { id: 'm2', text: 'Hi Sarah! We\'d love to help. What time works best for you?', sender: 'company', timestamp: '2026-03-19T09:15:00' },
      { id: 'm3', text: 'Would 9 AM work? The property is at 742 Evergreen Terrace.', sender: 'user', timestamp: '2026-03-19T09:20:00' },
      { id: 'm4', text: '9 AM is perfect. We\'ll send a 2-person team. Anything specific you\'d like us to focus on?', sender: 'company', timestamp: '2026-03-19T09:30:00' },
      { id: 'm5', text: 'The kitchen needs extra attention — there\'s some grease buildup around the stove. Also, please use eco-friendly products.', sender: 'user', timestamp: '2026-03-19T09:35:00' },
      { id: 'm6', text: 'Noted! We\'ll bring our eco line. The kitchen will get special treatment. I\'ve updated your quote to include the eco-friendly product upgrade ($15 extra).', sender: 'company', timestamp: '2026-03-19T09:45:00' },
      { id: 'm7', text: 'That\'s fine, thanks!', sender: 'user', timestamp: '2026-03-19T10:00:00' },
      { id: 'm8', text: 'Hi Sarah! Your deep clean is confirmed for this Saturday at 9 AM. See you then!', sender: 'company', timestamp: '2026-03-20T14:30:00' },
    ],
  },
  'prov-2': {
    companyName: 'ClearView Pros',
    avatar: 'CV',
    messages: [
      { id: 'm1', text: 'Hi, I need window washing for 12 windows at my house.', sender: 'user', timestamp: '2026-03-17T11:00:00' },
      { id: 'm2', text: 'Hello! We can definitely help with that. Interior and exterior?', sender: 'company', timestamp: '2026-03-17T11:10:00' },
      { id: 'm3', text: 'Both please. And can you clean the screens too?', sender: 'user', timestamp: '2026-03-17T11:15:00' },
      { id: 'm4', text: 'Absolutely! I\'ve sent you a quote for $180 — includes 12 windows interior/exterior plus screen cleaning. Let me know!', sender: 'company', timestamp: '2026-03-17T11:30:00' },
      { id: 'm5', text: 'Looks good. Let\'s do Monday the 25th.', sender: 'user', timestamp: '2026-03-18T09:00:00' },
      { id: 'm6', text: 'The window washing has been scheduled. Weather looks good for Monday.', sender: 'company', timestamp: '2026-03-19T10:15:00' },
    ],
  },
  'prov-3': {
    companyName: 'FreshFloor Inc.',
    avatar: 'FF',
    messages: [
      { id: 'm1', text: 'The carpets look amazing, thank you!', sender: 'user', timestamp: '2026-03-17T16:30:00' },
      { id: 'm2', text: 'Thank you for the review! We appreciate your business.', sender: 'company', timestamp: '2026-03-17T16:45:00' },
    ],
  },
};

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function ChatPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const convo = MOCK_CONVERSATIONS[companyId] ?? MOCK_CONVERSATIONS['prov-1'];

  const [messages, setMessages] = useState(convo.messages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      text: input.trim(),
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          {convo.avatar}
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">{convo.companyName}</h1>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.sender === 'user'
                  ? 'bg-[#AF52DE] text-white'
                  : 'bg-white text-gray-900 shadow-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`mt-1 text-right text-[10px] ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatMessageTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
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
            disabled={!input.trim()}
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
