'use client';

import Link from 'next/link';

const MOCK_THREADS = [
  {
    companyId: 'prov-1',
    companyName: 'SparkleClean Co.',
    avatar: 'SC',
    lastMessage: 'Hi Sarah! Your deep clean is confirmed for this Saturday at 9 AM. See you then!',
    timestamp: '2026-03-20T14:30:00',
    unread: 2,
  },
  {
    companyId: 'prov-2',
    companyName: 'ClearView Pros',
    avatar: 'CV',
    lastMessage: 'The window washing has been scheduled. Weather looks good for Monday.',
    timestamp: '2026-03-19T10:15:00',
    unread: 0,
  },
  {
    companyId: 'prov-3',
    companyName: 'FreshFloor Inc.',
    avatar: 'FF',
    lastMessage: 'Thank you for the review! We appreciate your business.',
    timestamp: '2026-03-17T16:45:00',
    unread: 0,
  },
];

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date(2026, 2, 20, 15, 0, 0);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      <div className="space-y-1">
        {MOCK_THREADS.map((thread) => (
          <Link
            key={thread.companyId}
            href={`/portal/messages/${thread.companyId}`}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
              {thread.avatar}
              {thread.unread > 0 && (
                <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#AF52DE] text-[10px] font-bold text-white">
                  {thread.unread}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${thread.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                  {thread.companyName}
                </h3>
                <span className="shrink-0 text-xs text-gray-400">{formatTime(thread.timestamp)}</span>
              </div>
              <p className={`truncate text-sm ${thread.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                {thread.lastMessage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
