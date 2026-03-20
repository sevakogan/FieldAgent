'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const MOCK_JOBS: Record<string, {
  id: string;
  service: string;
  address: string;
  date: string;
  time: string;
  provider: string;
  status: 'completed' | 'in_progress' | 'confirmed';
  checklist: Array<{ item: string; done: boolean }>;
  expenses: Array<{ label: string; amount: number }>;
  beforePhotos: string[];
  afterPhotos: string[];
  notes: string;
}> = {
  'job-1': {
    id: 'job-1',
    service: 'Deep Clean',
    address: '742 Evergreen Terrace',
    date: '2026-03-22',
    time: '9:00 AM',
    provider: 'SparkleClean Co.',
    status: 'completed',
    checklist: [
      { item: 'Kitchen — countertops, appliances, floor', done: true },
      { item: 'Bathrooms — scrub, sanitize, mirrors', done: true },
      { item: 'Bedrooms — dust, vacuum, make beds', done: true },
      { item: 'Living areas — dust, vacuum, mop', done: true },
      { item: 'Windows — interior glass cleaning', done: false },
      { item: 'Baseboards — wipe down', done: true },
    ],
    expenses: [
      { label: 'Deep Clean (3 bed, 2 bath)', amount: 285.00 },
      { label: 'Eco-friendly supplies surcharge', amount: 15.00 },
    ],
    beforePhotos: ['/placeholder-before-1.jpg', '/placeholder-before-2.jpg', '/placeholder-before-3.jpg'],
    afterPhotos: ['/placeholder-after-1.jpg', '/placeholder-after-2.jpg', '/placeholder-after-3.jpg'],
    notes: 'Extra attention given to kitchen grease buildup. Left eco-friendly air freshener.',
  },
  'job-2': {
    id: 'job-2',
    service: 'Window Washing',
    address: '742 Evergreen Terrace',
    date: '2026-03-25',
    time: '1:00 PM',
    provider: 'ClearView Pros',
    status: 'confirmed',
    checklist: [
      { item: 'Exterior windows — all floors', done: false },
      { item: 'Interior windows — all floors', done: false },
      { item: 'Screen cleaning', done: false },
      { item: 'Track cleaning', done: false },
    ],
    expenses: [
      { label: 'Window Washing (12 windows)', amount: 180.00 },
    ],
    beforePhotos: [],
    afterPhotos: [],
    notes: '',
  },
};

const STATUS_STYLES = {
  completed: 'bg-green-50 text-green-700',
  in_progress: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-yellow-50 text-yellow-700',
} as const;

const STATUS_LABELS = {
  completed: 'Completed',
  in_progress: 'In Progress',
  confirmed: 'Upcoming',
} as const;

export default function JobReviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  const job = MOCK_JOBS[jobId] ?? MOCK_JOBS['job-1'];

  const [tipPercent, setTipPercent] = useState(15);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [photoTab, setPhotoTab] = useState<'before' | 'after'>('after');

  const subtotal = job.expenses.reduce((sum, e) => sum + e.amount, 0);
  const tipAmount = subtotal * (tipPercent / 100);

  const completedCount = job.checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.service}</h1>
          <p className="text-sm text-gray-500">{job.address}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status]}`}>
          {STATUS_LABELS[job.status]}
        </span>
      </div>

      {/* Info card */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(job.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Time</p>
            <p className="font-medium text-gray-900">{job.time}</p>
          </div>
          <div>
            <p className="text-gray-400">Provider</p>
            <p className="font-medium text-gray-900">{job.provider}</p>
          </div>
          <div>
            <p className="text-gray-400">Checklist</p>
            <p className="font-medium text-gray-900">{completedCount}/{job.checklist.length} done</p>
          </div>
        </div>
      </div>

      {/* Before/After Photos */}
      {(job.beforePhotos.length > 0 || job.afterPhotos.length > 0) && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Photos</h2>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setPhotoTab('before')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                photoTab === 'before' ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600'
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setPhotoTab('after')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                photoTab === 'after' ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600'
              }`}
            >
              After
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(photoTab === 'before' ? job.beforePhotos : job.afterPhotos).map((src, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-[#AF52DE]/20 to-[#AF52DE]/5 flex items-center justify-center">
                <svg className="h-8 w-8 text-[#AF52DE]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Checklist */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Checklist</h2>
        <ul className="space-y-2">
          {job.checklist.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {item.done && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={item.done ? 'text-gray-900' : 'text-gray-400'}>{item.item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Notes */}
      {job.notes && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Provider Notes</h2>
          <p className="text-sm text-gray-600">{job.notes}</p>
        </section>
      )}

      {/* Expenses */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Expenses</h2>
        <ul className="space-y-2">
          {job.expenses.map((exp, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{exp.label}</span>
              <span className="font-medium text-gray-900">${exp.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-900">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Tip Slider */}
      {job.status === 'completed' && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Leave a Tip</h2>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              {[0, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTipPercent(pct)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    tipPercent === pct ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={tipPercent}
            onChange={(e) => setTipPercent(Number(e.target.value))}
            className="w-full accent-[#AF52DE]"
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-500">Tip: {tipPercent}%</span>
            <span className="font-semibold text-[#AF52DE]">${tipAmount.toFixed(2)}</span>
          </div>
        </section>
      )}

      {/* Approve / Reject */}
      {job.status === 'completed' && approved === null && (
        <div className="flex gap-3">
          <button
            onClick={() => setApproved(true)}
            className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 text-center font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Approve Job
          </button>
          <button
            onClick={() => setApproved(false)}
            className="flex-1 rounded-2xl border border-red-200 bg-white py-3.5 text-center font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
          >
            Request Revision
          </button>
        </div>
      )}

      {approved !== null && (
        <div className={`rounded-2xl p-4 text-center shadow-sm ${approved ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-semibold ${approved ? 'text-green-700' : 'text-red-700'}`}>
            {approved ? 'Job approved! Thank you.' : 'Revision requested. Your provider has been notified.'}
          </p>
        </div>
      )}
    </div>
  );
}
