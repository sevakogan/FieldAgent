'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Step =
  | 'DRIVING'
  | 'ARRIVED'
  | 'BEFORE_PHOTOS'
  | 'IN_PROGRESS'
  | 'EXPENSES'
  | 'AFTER_PHOTOS'
  | 'COMPLETE';

const STEPS: readonly Step[] = [
  'DRIVING',
  'ARRIVED',
  'BEFORE_PHOTOS',
  'IN_PROGRESS',
  'EXPENSES',
  'AFTER_PHOTOS',
  'COMPLETE',
] as const;

const STEP_LABELS: Record<Step, string> = {
  DRIVING: 'Driving',
  ARRIVED: 'Arrived',
  BEFORE_PHOTOS: 'Before Photos',
  IN_PROGRESS: 'In Progress',
  EXPENSES: 'Expenses',
  AFTER_PHOTOS: 'After Photos',
  COMPLETE: 'Complete',
};

const STEP_COLORS: Record<Step, string> = {
  DRIVING: '#5AC8FA',
  ARRIVED: '#FFD60A',
  BEFORE_PHOTOS: '#AF52DE',
  IN_PROGRESS: '#007AFF',
  EXPENSES: '#FF9F0A',
  AFTER_PHOTOS: '#AF52DE',
  COMPLETE: '#34C759',
};

interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
}

interface Expense {
  readonly id: string;
  readonly description: string;
  readonly amount: number;
}

const MOCK_JOB = {
  id: 'j-002',
  clientName: 'Marcus Chen',
  address: '890 Oak Avenue, Apt 4B, Portland, OR 97205',
  service: 'Standard Clean - 2BR Apartment',
  time: '11:30 AM',
  duration: '2h',
  amount: 120,
  notes: 'Please use fragrance-free products. Dog-friendly home.',
} as const;

const INITIAL_CHECKLIST: readonly ChecklistItem[] = [
  { id: 'c1', label: 'Vacuum all rooms', checked: false },
  { id: 'c2', label: 'Mop hard floors', checked: false },
  { id: 'c3', label: 'Clean kitchen surfaces', checked: false },
  { id: 'c4', label: 'Sanitize bathrooms', checked: false },
  { id: 'c5', label: 'Dust all surfaces', checked: false },
  { id: 'c6', label: 'Empty trash cans', checked: false },
  { id: 'c7', label: 'Make beds', checked: false },
  { id: 'c8', label: 'Wipe mirrors & glass', checked: false },
] as const;

function ProgressBar({ currentStep }: { readonly currentStep: Step }) {
  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            color: STEP_COLORS[currentStep],
            backgroundColor: `${STEP_COLORS[currentStep]}1A`,
          }}
        >
          {STEP_LABELS[currentStep]}
        </span>
        <span className="text-xs text-[#8E8E93] font-medium">
          {currentIndex + 1} of {STEPS.length}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: STEP_COLORS[currentStep] }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function DrivingStep({ onNext }: { readonly onNext: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Destination</h3>
        <p className="text-sm text-[#8E8E93] mb-4">{MOCK_JOB.address}</p>
        <a
          href={`https://maps.apple.com/?daddr=${encodeURIComponent(MOCK_JOB.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#5AC8FA] text-white font-semibold text-sm rounded-xl no-underline hover:opacity-90 transition-opacity"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3,11 22,2 13,21 11,13" />
          </svg>
          Open Navigation
        </a>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Job Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8E8E93]">Client</span>
            <span className="font-medium text-gray-900">{MOCK_JOB.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E8E93]">Service</span>
            <span className="font-medium text-gray-900">{MOCK_JOB.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E8E93]">Duration</span>
            <span className="font-medium text-gray-900">{MOCK_JOB.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E8E93]">Pay</span>
            <span className="font-bold text-gray-900">${MOCK_JOB.amount}</span>
          </div>
        </div>
        {MOCK_JOB.notes && (
          <div className="mt-3 p-3 bg-[#FFD60A]/10 rounded-xl">
            <p className="text-xs font-semibold text-[#FFD60A] mb-0.5">Note</p>
            <p className="text-xs text-gray-700">{MOCK_JOB.notes}</p>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#5AC8FA] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
      >
        I&apos;ve Arrived
      </button>
    </div>
  );
}

function ArrivedStep({ onNext }: { readonly onNext: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFD60A]/20 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">You&apos;ve Arrived</h3>
        <p className="text-sm text-[#8E8E93]">{MOCK_JOB.address}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#FFD60A] text-gray-900 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
      >
        Start Taking Before Photos
      </button>
    </div>
  );
}

function PhotoStep({
  label,
  color,
  onNext,
}: {
  readonly label: string;
  readonly color: string;
  readonly onNext: () => void;
}) {
  const [photos, setPhotos] = useState<readonly string[]>([]);

  const addPhoto = () => {
    setPhotos((prev) => [...prev, `photo-${prev.length + 1}`]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-gray-900 mb-3">{label}</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((p, i) => (
            <div
              key={p}
              className="aspect-square rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: `${color}33` }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          ))}
          <button
            onClick={addPhoto}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-gray-300 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-[10px] text-[#8E8E93] font-medium">Add</span>
          </button>
        </div>
        <p className="text-xs text-[#8E8E93]">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} taken
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
        style={{ backgroundColor: color }}
      >
        Continue
      </button>
    </div>
  );
}

function InProgressStep({ onNext }: { readonly onNext: () => void }) {
  const [checklist, setChecklist] = useState<readonly ChecklistItem[]>(INITIAL_CHECKLIST);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const completedCount = checklist.filter((c) => c.checked).length;
  const allDone = completedCount === checklist.length;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
        <p className="text-xs text-[#8E8E93] font-medium mb-1">Elapsed Time</p>
        <p className="text-4xl font-black text-gray-900 tabular-nums">
          {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:
          {String(secs).padStart(2, '0')}
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Checklist</h3>
          <span className="text-xs font-semibold text-[#007AFF]">
            {completedCount}/{checklist.length}
          </span>
        </div>
        <div className="space-y-1">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  item.checked
                    ? 'bg-[#34C759] border-[#34C759]'
                    : 'border-gray-300'
                }`}
              >
                {item.checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${
                  item.checked
                    ? 'text-[#8E8E93] line-through'
                    : 'text-gray-900 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!allDone}
        className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all ${
          allDone
            ? 'bg-[#007AFF] text-white hover:opacity-90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {allDone ? 'Mark Tasks Complete' : `Complete all items (${completedCount}/${checklist.length})`}
      </button>
    </div>
  );
}

function ExpensesStep({ onNext }: { readonly onNext: () => void }) {
  const [expenses, setExpenses] = useState<readonly Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const addExpense = () => {
    if (!description.trim() || !amount.trim()) return;
    const newExpense: Expense = {
      id: `e-${Date.now()}`,
      description: description.trim(),
      amount: parseFloat(amount),
    };
    setExpenses((prev) => [...prev, newExpense]);
    setDescription('');
    setAmount('');
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Add Expense</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (e.g., cleaning supplies)"
            className="w-full px-4 py-3 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder:text-[#8E8E93] outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder:text-[#8E8E93] outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
              />
            </div>
            <button
              onClick={addExpense}
              className="px-5 py-3 bg-[#FF9F0A] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-900">{exp.description}</span>
                <span className="text-sm font-semibold text-gray-900">${exp.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-sm font-black text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#FF9F0A] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
      >
        {expenses.length > 0 ? 'Continue' : 'Skip — No Expenses'}
      </button>
    </div>
  );
}

function CompleteStep() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 rounded-full bg-[#34C759]/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </motion.div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Job Complete!</h3>
        <p className="text-sm text-[#8E8E93] mb-4">Great work on this one.</p>

        <div className="bg-[#F2F2F7] rounded-xl p-4 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-[#8E8E93]">Client</span>
            <span className="font-medium text-gray-900">{MOCK_JOB.clientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8E8E93]">Service</span>
            <span className="font-medium text-gray-900">{MOCK_JOB.service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8E8E93]">Earnings</span>
            <span className="font-bold text-[#34C759]">${MOCK_JOB.amount}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/worker')}
        className="w-full py-3.5 bg-[#34C759] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
      >
        Back to Schedule
      </button>
    </div>
  );
}

export default function JobExecutionPage() {
  const params = useParams();
  const [currentStep, setCurrentStep] = useState<Step>('DRIVING');

  const goToNext = useCallback(() => {
    setCurrentStep((prev) => {
      const currentIndex = STEPS.indexOf(prev);
      return currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : prev;
    });
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 'DRIVING':
        return <DrivingStep onNext={goToNext} />;
      case 'ARRIVED':
        return <ArrivedStep onNext={goToNext} />;
      case 'BEFORE_PHOTOS':
        return <PhotoStep label="Before Photos" color="#AF52DE" onNext={goToNext} />;
      case 'IN_PROGRESS':
        return <InProgressStep onNext={goToNext} />;
      case 'EXPENSES':
        return <ExpensesStep onNext={goToNext} />;
      case 'AFTER_PHOTOS':
        return <PhotoStep label="After Photos" color="#AF52DE" onNext={goToNext} />;
      case 'COMPLETE':
        return <CompleteStep />;
      default:
        return null;
    }
  };

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <h1 className="text-lg font-black text-gray-900">{MOCK_JOB.clientName}</h1>
          <p className="text-xs text-[#8E8E93]">{MOCK_JOB.service}</p>
        </div>
        <span className="text-sm font-bold text-gray-900">${MOCK_JOB.amount}</span>
      </div>

      <ProgressBar currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
