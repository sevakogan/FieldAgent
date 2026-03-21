'use client';

import { useState, useEffect } from 'react';
import { getPortalSettings, updatePortalProfile } from '@/lib/actions/portal';
import type { PortalSettingsData } from '@/lib/actions/portal';

const NOTIFICATION_SETTINGS = [
  { id: 'job_reminders', label: 'Job Reminders', desc: 'Notify me before scheduled cleans', enabled: true },
  { id: 'job_completed', label: 'Job Completed', desc: 'When a cleaning job is finished', enabled: true },
  { id: 'invoice_received', label: 'New Invoices', desc: 'When a new invoice is created', enabled: true },
  { id: 'quote_received', label: 'New Quotes', desc: 'When a provider sends a quote', enabled: true },
  { id: 'messages', label: 'Messages', desc: 'New messages from providers', enabled: true },
  { id: 'promotions', label: 'Promotions', desc: 'Deals and special offers', enabled: false },
];

export default function SettingsPage() {
  const [data, setData] = useState<PortalSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATION_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    getPortalSettings().then(result => {
      if (result.success && result.data) {
        setData(result.data);
        setName(result.data.client.fullName);
        setEmail(result.data.client.email);
        setPhone(result.data.client.phone ?? '');
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePortalProfile({
      fullName: name,
      email,
      phone,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-400">No client account found</p>
      </div>
    );
  }

  const initials = data.client.fullName.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#AF52DE] text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{data.client.fullName}</p>
            <p className="text-sm text-gray-500">{data.client.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl bg-[#AF52DE] py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Password</h2>
            <p className="text-sm text-gray-500">Update your password</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="rounded-xl bg-[#F2F2F7] px-4 py-2 text-sm font-medium text-gray-700"
          >
            {showPasswordForm ? 'Cancel' : 'Change'}
          </button>
        </div>
        {showPasswordForm && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Current Password</label>
              <input type="password" className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">New Password</label>
              <input type="password" className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Confirm New Password</label>
              <input type="password" className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]" />
            </div>
            <button className="w-full rounded-2xl bg-[#AF52DE] py-3 font-semibold text-white">
              Update Password
            </button>
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Notifications</h2>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                <p className="text-xs text-gray-500">{notif.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(notif.id)}
                className={`relative h-7 w-12 rounded-full transition-colors ${notif.enabled ? 'bg-[#AF52DE]' : 'bg-gray-300'}`}
              >
                <div
                  className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: notif.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Properties</h2>
        {data.addresses.length === 0 ? (
          <p className="text-sm text-gray-400">No properties registered</p>
        ) : (
          <div className="space-y-2">
            {data.addresses.map((addr) => (
              <div key={addr.id} className="flex items-center gap-3 rounded-xl bg-[#F2F2F7] px-3 py-2.5">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm text-gray-700">{addr.display}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
