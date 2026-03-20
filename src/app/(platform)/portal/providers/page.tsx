'use client';

import Link from 'next/link';

const MOCK_PROVIDERS = [
  {
    id: 'prov-1',
    name: 'SparkleClean Co.',
    rating: 4.9,
    reviews: 127,
    services: ['Standard Clean', 'Deep Clean', 'Move In/Out'],
    since: '2025-06-15',
    avatar: 'SC',
    verified: true,
  },
  {
    id: 'prov-2',
    name: 'ClearView Pros',
    rating: 4.7,
    reviews: 84,
    services: ['Window Washing', 'Pressure Washing'],
    since: '2025-09-22',
    avatar: 'CV',
    verified: true,
  },
  {
    id: 'prov-3',
    name: 'FreshFloor Inc.',
    rating: 4.8,
    reviews: 56,
    services: ['Carpet Cleaning', 'Tile & Grout'],
    since: '2026-01-10',
    avatar: 'FF',
    verified: false,
  },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
      <span className="text-sm font-medium text-gray-900">{rating}</span>
      <span className="text-xs text-gray-400">({rating} reviews)</span>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Providers</h1>
      <p className="text-sm text-gray-500">Companies you&apos;re connected with on KleanHQ.</p>

      <div className="space-y-3">
        {MOCK_PROVIDERS.map((provider) => (
          <div key={provider.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
                {provider.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  {provider.verified && (
                    <svg className="h-4 w-4 text-[#AF52DE]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <StarDisplay rating={provider.rating} />
                <div className="mt-2 flex flex-wrap gap-1">
                  {provider.services.map((svc) => (
                    <span key={svc} className="rounded-full bg-[#F2F2F7] px-2 py-0.5 text-xs text-gray-600">
                      {svc}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Connected since {new Date(provider.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
              <Link
                href={`/portal/messages/${provider.id}`}
                className="flex-1 rounded-xl bg-[#AF52DE] py-2 text-center text-sm font-medium text-white"
              >
                Message
              </Link>
              <Link
                href="/portal/request"
                className="flex-1 rounded-xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-700"
              >
                Request Service
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
