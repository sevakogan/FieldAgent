'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

const PROFILE_DATA = {
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  phone: '(503) 555-0142',
  role: 'Pro Cleaner',
  joinedDate: 'January 2025',
  totalJobs: 347,
  avgRating: 4.9,
  totalEarnings: 28450,
} as const;

const PAYOUT_DATA = {
  method: 'Direct Deposit',
  bank: 'Chase Bank ****4821',
  nextPayout: 'Mar 22, 2026',
  pendingAmount: 550,
  schedule: 'Weekly (Sundays)',
} as const;

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

export default function WorkerProfilePage() {
  const [notifications, setNotifications] = useState<readonly NotificationSetting[]>(
    INITIAL_NOTIFICATIONS
  );

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] flex items-center justify-center text-white text-3xl font-black mb-3 shadow-[0_4px_16px_rgba(0,122,255,0.3)]">
          JD
        </div>
        <h1 className="text-xl font-black text-gray-900">{PROFILE_DATA.name}</h1>
        <p className="text-sm text-[#8E8E93]">{PROFILE_DATA.role}</p>
        <p className="text-xs text-[#8E8E93] mt-0.5">
          Member since {PROFILE_DATA.joinedDate}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-gray-900">{PROFILE_DATA.totalJobs}</p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Jobs Done</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-[#FFD60A]">{PROFILE_DATA.avgRating}</p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Rating</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl font-black text-[#34C759]">
            ${(PROFILE_DATA.totalEarnings / 1000).toFixed(1)}k
          </p>
          <p className="text-[11px] text-[#8E8E93] font-medium">Earned</p>
        </motion.div>
      </div>

      <div className="space-y-4">
        {/* Contact Info */}
        <SectionCard title="Contact Info">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Email</span>
              <span className="text-sm font-medium text-gray-900">
                {PROFILE_DATA.email}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Phone</span>
              <span className="text-sm font-medium text-gray-900">
                {PROFILE_DATA.phone}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Payout Status */}
        <SectionCard title="Payout">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Method</span>
              <span className="text-sm font-medium text-gray-900">
                {PAYOUT_DATA.method}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Account</span>
              <span className="text-sm font-medium text-gray-900">
                {PAYOUT_DATA.bank}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Schedule</span>
              <span className="text-sm font-medium text-gray-900">
                {PAYOUT_DATA.schedule}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Next Payout</span>
              <span className="text-sm font-medium text-gray-900">
                {PAYOUT_DATA.nextPayout}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#8E8E93]">Pending</span>
              <span className="text-sm font-bold text-[#34C759]">
                ${PAYOUT_DATA.pendingAmount}
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
