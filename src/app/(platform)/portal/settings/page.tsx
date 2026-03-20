'use client';

import { useState } from 'react';

const MOCK_PROFILE = {
  name: 'Sarah Miller',
  email: 'sarah@example.com',
  phone: '(555) 123-4567',
  addresses: ['742 Evergreen Terrace', '123 Ocean Ave, Unit 4B', '456 Palm Drive'],
};

const MOCK_CO_CLIENTS = [
  { id: 'cc-1', name: 'James Miller', email: 'james@example.com', role: 'co-owner' },
  { id: 'cc-2', name: 'Maria Garcia', email: 'maria@example.com', role: 'property-manager' },
];

const NOTIFICATION_SETTINGS = [
  { id: 'job_reminders', label: 'Job Reminders', desc: 'Notify me before scheduled cleans', enabled: true },
  { id: 'job_completed', label: 'Job Completed', desc: 'When a cleaning job is finished', enabled: true },
  { id: 'invoice_received', label: 'New Invoices', desc: 'When a new invoice is created', enabled: true },
  { id: 'quote_received', label: 'New Quotes', desc: 'When a provider sends a quote', enabled: true },
  { id: 'messages', label: 'Messages', desc: 'New messages from providers', enabled: true },
  { id: 'promotions', label: 'Promotions', desc: 'Deals and special offers', enabled: false },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [notifications, setNotifications] = useState(NOTIFICATION_SETTINGS);
  const [coClients, setCoClients] = useState(MOCK_CO_CLIENTS);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newClient = {
      id: `cc-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'viewer',
    };
    setCoClients((prev) => [...prev, newClient]);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleRemoveCoClient = (id: string) => {
    setCoClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#AF52DE] text-xl font-bold text-white">
            {profile.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.name}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-[#AF52DE] py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {saved ? 'Saved!' : 'Save Changes'}
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

      {/* Co-Clients */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Co-Clients</h2>
            <p className="text-sm text-gray-500">People who can access your portal</p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white"
          >
            Invite
          </button>
        </div>

        {showInviteForm && (
          <div className="mb-4 space-y-3 rounded-xl bg-[#F2F2F7] p-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowInviteForm(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700">
                Cancel
              </button>
              <button onClick={handleInvite} className="flex-1 rounded-xl bg-[#AF52DE] py-2 text-sm font-medium text-white">
                Send Invite
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {coClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] text-xs font-bold text-gray-600">
                  {client.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.email} &middot; <span className="capitalize">{client.role.replace('-', ' ')}</span></p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveCoClient(client.id)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Properties</h2>
        <div className="space-y-2">
          {profile.addresses.map((addr) => (
            <div key={addr} className="flex items-center gap-3 rounded-xl bg-[#F2F2F7] px-3 py-2.5">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-sm text-gray-700">{addr}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Delete Account */}
      <section className="rounded-2xl border border-red-200 bg-white p-4">
        <h2 className="font-semibold text-red-600">Delete Account</h2>
        <p className="mb-3 text-sm text-gray-500">This action is permanent and cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-2xl border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3 rounded-xl bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">Are you sure? All data will be permanently deleted.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white">
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
