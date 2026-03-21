'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPortalJob, approvePortalJob, requestJobRevision, updatePortalTip } from '@/lib/actions/portal';
import type { PortalJobDetail } from '@/lib/actions/portal';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-50 text-green-700',
  charged: 'bg-green-50 text-green-700',
  in_progress: 'bg-blue-50 text-blue-700',
  scheduled: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-yellow-50 text-yellow-700',
  requested: 'bg-purple-50 text-purple-700',
  pending_review: 'bg-orange-50 text-orange-700',
  revision_needed: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  charged: 'Charged',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  approved: 'Approved',
  requested: 'Requested',
  pending_review: 'Pending Review',
  revision_needed: 'Revision Needed',
  cancelled: 'Cancelled',
};

export default function JobReviewPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<PortalJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipPercent, setTipPercent] = useState(15);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [photoTab, setPhotoTab] = useState<'before' | 'after'>('after');
  const [savingTip, setSavingTip] = useState(false);

  useEffect(() => {
    getPortalJob(jobId).then(result => {
      if (result.success && result.data) {
        setJob(result.data);
        if (result.data.tipAmount > 0 && result.data.price > 0) {
          setTipPercent(Math.round((result.data.tipAmount / result.data.price) * 100));
        }
      } else {
        setError(result.error ?? 'Job not found');
      }
      setLoading(false);
    });
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">{error ?? 'Job not found'}</p>
        </div>
      </div>
    );
  }

  const tipAmount = job.price * (tipPercent / 100);
  const isReviewable = job.status === 'pending_review' || job.status === 'completed';
  const checklist = job.checklistResults ?? [];
  const completedCount = checklist.filter(c => c.done).length;

  const handleApprove = async () => {
    setApproved(true);
    await approvePortalJob(jobId);
  };

  const handleReject = async () => {
    setApproved(false);
    await requestJobRevision(jobId);
  };

  const handleSaveTip = async () => {
    setSavingTip(true);
    await updatePortalTip(jobId, tipAmount);
    setSavingTip(false);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">{job.serviceName}</h1>
          <p className="text-sm text-gray-500">{job.address}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[job.status] ?? job.status}
        </span>
      </div>

      {/* Info card */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(job.scheduledDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Time</p>
            <p className="font-medium text-gray-900">{job.scheduledTime ?? 'TBD'}</p>
          </div>
          <div>
            <p className="text-gray-400">Provider</p>
            <p className="font-medium text-gray-900">{job.companyName}</p>
          </div>
          {checklist.length > 0 && (
            <div>
              <p className="text-gray-400">Checklist</p>
              <p className="font-medium text-gray-900">{completedCount}/{checklist.length} done</p>
            </div>
          )}
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
              Before ({job.beforePhotos.length})
            </button>
            <button
              onClick={() => setPhotoTab('after')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                photoTab === 'after' ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600'
              }`}
            >
              After ({job.afterPhotos.length})
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(photoTab === 'before' ? job.beforePhotos : job.afterPhotos).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${photoTab} photo ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
            {(photoTab === 'before' ? job.beforePhotos : job.afterPhotos).length === 0 && (
              <div className="col-span-3 py-4 text-center text-sm text-gray-400">No {photoTab} photos</div>
            )}
          </div>
        </section>
      )}

      {/* Checklist */}
      {checklist.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Checklist</h2>
          <ul className="space-y-2">
            {checklist.map((item, i) => (
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
      )}

      {/* Notes */}
      {job.notes && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Provider Notes</h2>
          <p className="text-sm text-gray-600">{job.notes}</p>
        </section>
      )}

      {/* Price */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Price</h2>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${job.price.toFixed(2)}</span>
        </div>
      </section>

      {/* Tip Slider */}
      {isReviewable && (
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
          {tipAmount > 0 && (
            <button
              onClick={handleSaveTip}
              disabled={savingTip}
              className="mt-3 w-full rounded-2xl bg-[#AF52DE]/10 py-2.5 text-sm font-medium text-[#AF52DE] transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {savingTip ? 'Saving...' : 'Save Tip'}
            </button>
          )}
        </section>
      )}

      {/* Approve / Reject */}
      {isReviewable && approved === null && (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 text-center font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Approve Job
          </button>
          <button
            onClick={handleReject}
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
