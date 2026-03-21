'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getWorkerInfo, getWorkerProfileStats, updateWorkerProfile } from '@/lib/actions/worker';
import type { WorkerInfo, WorkerProfileStats } from '@/lib/actions/worker';

interface NotificationSetting {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
}

const INITIAL_NOTIFICATIONS: readonly NotificationSetting[] = [
  { id: 'new-jobs', label: 'New Job Assignments', description: 'Get notified when you receive a new job', enabled: true },
  { id: 'reminders', label: 'Job Reminders', description: '30 minutes before each scheduled job', enabled: true },
  { id: 'payments', label: 'Payment Updates', description: 'When payments are processed or tips received', enabled: true },
  { id: 'messages', label: 'Client Messages', description: 'Direct messages from clients', enabled: false },
  { id: 'weekly', label: 'Weekly Summary', description: 'Earnings and performance recap every Sunday', enabled: true },
] as const;

function Toggle({
  enabled,
  onToggle,
}: {
  readonly enabled: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors ${
        enabled ? 'bg-[#34C759]' : 'bg-gray-300'
      }`}
    >
      <motion.div
        className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function SectionCard({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-4">{children}</div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatPayType(payType: string | null): string {
  switch (payType) {
    case 'per_job': return 'Per Job';
    case 'hourly': return 'Hourly';
    case 'percentage': return 'Percentage';
    case 'manual': return 'Manual';
    default: return 'Not set';
  }
}

function formatPayRate(payType: string | null, payRate: number | null): string {
  if (payRate === null) return 'Not set';
  switch (payType) {
    case 'hourly': return `$${payRate}/hr`;
    case 'percentage': return `${payRate}%`;
    case 'per_job': return `$${payRate}/job`;
    default: return `$${payRate}`;
  }
}

export default function WorkerProfilePage() {
  const [worker, setWorker] = useState<WorkerInfo | null>(null);
  const [stats, setStats] = useState<WorkerProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<readonly NotificationSetting[]>(
    INITIAL_NOTIFICATIONS
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    Promise.all([getWorkerInfo(), getWorkerProfileStats()]).then(([workerRes, statsRes]) => {
      if (workerRes.success && workerRes.data) {
        setWorker(workerRes.data);
        setEditName(workerRes.data.fullName);
        setEditPhone(workerRes.data.phone ?? '');
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      setLoading(false);
    });
  }, []);

  const handleStartEdit = useCallback(() => {
    if (worker) {
      setEditName(worker.fullName);
      setEditPhone(worker.phone ?? '');
      setIsEditing(true);
    }
  }, [worker]);

  const handleSaveProfile = useCallback(async () => {
    if (!worker) return;
    setSaving(true);
    const result = await updateWorkerProfile(worker.userId, {
      full_name: editName,
      phone: editPhone,
    });
    if (result.success) {
      setWorker({ ...worker, fullName: editName, phone: editPhone || null });
      setIsEditing(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    }
    setSaving(false);
  }, [worker, editName, editPhone]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  if (loading) {
    return (
      <div className="p-5 max-w-lg mx-auto animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-3.5 text-center">
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const initials = worker ? getInitials(worker.fullName) : '?';
  const roleName = worker?.role === 'owner' ? 'Owner' : worker?.role === 'lead' ? 'Lead Cleaner' : 'Cleaner';
  const joinedDate = worker
    ? new Date(worker.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] flex items-center justify-center text-white text-3xl font-black mb-3 shadow-[0_4px_16px_rgba(0,122,255,0.3)]">
          {initials}
        </div>
        <h1 className="text-xl font-black text-gray-900">{worker?.fullName ?? 'Unknown'}</h1>
        <p className="text-sm text-[#8E8E93]">{roleName}</p>
        {joinedDate && (
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Member since {joinedDate}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-gray-900">{stats?.totalJobs ?? 0}</p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Jobs Done</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-[#FFD60A]">
            {stats?.avgRating !== null && stats?.avgRating !== undefined ? stats.avgRating.toFixed(1) : '—'}
          </p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Rating</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-[#34C759]">
            {stats?.totalEarned
              ? stats.totalEarned >= 1000
                ? `$${(stats.totalEarned / 1000).toFixed(1)}k`
                : `$${stats.totalEarned}`
              : '$0'}
          </p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Earned</p>
        </motion.div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#34C759] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
        >
          Profile saved
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Contact Info */}
        <SectionCard title="Contact Info">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#007AFF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Email</label>
                <input
                  type="email"
                  value={worker?.email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-[#8E8E93]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#007AFF] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-[#8E8E93]">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {worker?.email ?? '—'}
                </span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-[#8E8E93]">Phone</span>
                <span className="text-sm font-medium text-gray-900">
                  {worker?.phone ?? '—'}
                </span>
              </div>
              <button
                onClick={handleStartEdit}
                className="w-full py-2.5 rounded-xl bg-[#007AFF]/10 text-[#007AFF] text-sm font-semibold hover:bg-[#007AFF]/20 transition-colors mt-2"
              >
                Edit Profile
              </button>
            </div>
          )}
        </SectionCard>

        {/* Pay Info */}
        <SectionCard title="Pay Info">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Pay Type</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPayType(worker?.payType ?? null)}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Pay Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPayRate(worker?.payType ?? null, worker?.payRate ?? null)}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications">
          <div className="space-y-1">
            {notifications.map((setting, i) => (
              <div key={setting.id}>
                {i > 0 && <div className="border-t border-gray-100" />}
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-medium text-gray-900">
                      {setting.label}
                    </p>
                    <p className="text-xs text-[#8E8E93] mt-0.5">
                      {setting.description}
                    </p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggleNotification(setting.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Sign Out */}
        <button className="w-full py-3.5 bg-white text-[#FF3B30] font-semibold text-sm rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
