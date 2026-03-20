'use client';

import { useState } from 'react';
import Link from 'next/link';

const SERVICE_TYPES = [
  { id: 'standard', label: 'Standard Clean', desc: 'Regular maintenance cleaning', price: '$120–$180', icon: '🧹' },
  { id: 'deep', label: 'Deep Clean', desc: 'Thorough top-to-bottom clean', price: '$250–$400', icon: '✨' },
  { id: 'move', label: 'Move In/Out', desc: 'Full property turnover clean', price: '$350–$600', icon: '📦' },
  { id: 'windows', label: 'Window Washing', desc: 'Interior & exterior glass', price: '$150–$300', icon: '🪟' },
  { id: 'carpet', label: 'Carpet Cleaning', desc: 'Steam or dry cleaning', price: '$200–$350', icon: '🧶' },
  { id: 'custom', label: 'Custom Request', desc: 'Describe what you need', price: 'Quote', icon: '📝' },
];

const ADDRESSES = [
  '742 Evergreen Terrace',
  '123 Ocean Ave, Unit 4B',
  '456 Palm Drive',
];

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const FREQUENCY_OPTIONS = [
  { id: 'once', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export default function RequestServicePage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Request Submitted!</h2>
        <p className="mb-6 text-sm text-gray-500">
          Your service request has been sent. You&apos;ll receive a quote within 24 hours.
        </p>
        <Link href="/portal" className="rounded-2xl bg-[#AF52DE] px-6 py-3 font-semibold text-white">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request Service</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              s <= step ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-400'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 rounded ${s < step ? 'bg-[#AF52DE]' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {step === 1 ? 'Service' : step === 2 ? 'Schedule' : 'Review'}
        </span>
      </div>

      {/* Step 1: Service type */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">What service do you need?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICE_TYPES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                  selectedService === svc.id
                    ? 'border-[#AF52DE] bg-[#AF52DE]/5'
                    : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{svc.icon}</span>
                <h3 className="mt-2 font-semibold text-gray-900">{svc.label}</h3>
                <p className="text-sm text-gray-500">{svc.desc}</p>
                <p className="mt-1 text-sm font-medium text-[#AF52DE]">{svc.price}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedService && setStep(2)}
            disabled={!selectedService}
            className="w-full rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Schedule */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Schedule &amp; Details</h2>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Property</label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#AF52DE]"
            >
              {ADDRESSES.map((addr) => (
                <option key={addr} value={addr}>{addr}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#AF52DE]"
            />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">Preferred Time</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedTime === t ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrequency(f.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    frequency === f.id ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Special Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Allergies, access codes, pets, etc."
              className="w-full resize-none rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#AF52DE]"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700">
              Back
            </button>
            <button
              onClick={() => selectedDate && selectedTime ? setStep(3) : null}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Review Your Request</h2>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Service</dt>
                <dd className="font-medium text-gray-900">{SERVICE_TYPES.find((s) => s.id === selectedService)?.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Property</dt>
                <dd className="font-medium text-gray-900">{selectedAddress}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium text-gray-900">{selectedDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Time</dt>
                <dd className="font-medium text-gray-900">{selectedTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Frequency</dt>
                <dd className="font-medium text-gray-900 capitalize">{FREQUENCY_OPTIONS.find((f) => f.id === frequency)?.label}</dd>
              </div>
              {notes && (
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="mt-1 font-medium text-gray-900">{notes}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700">
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
