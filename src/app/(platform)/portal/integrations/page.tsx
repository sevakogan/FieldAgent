'use client';

import { useState, useCallback } from 'react';

type Integration = {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly icon: string;
  readonly color: string;
  readonly connected: boolean;
  readonly apiKey: string;
};

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'airbnb', name: 'Airbnb', desc: 'Auto-schedule cleans between guest stays', icon: '🏠', color: '#FF5A5F', connected: false, apiKey: '' },
  { id: 'vrbo', name: 'VRBO', desc: 'Sync bookings for turnover cleaning', icon: '🏡', color: '#0E4DA4', connected: false, apiKey: '' },
  { id: 'booking', name: 'Booking.com', desc: 'Import reservations automatically', icon: '🅱️', color: '#003580', connected: false, apiKey: '' },
  { id: 'guesty', name: 'Guesty', desc: 'Property management integration', icon: '🔑', color: '#1E88E5', connected: false, apiKey: '' },
  { id: 'hostaway', name: 'Hostaway', desc: 'Channel manager sync', icon: '📡', color: '#4CAF50', connected: false, apiKey: '' },
  { id: 'turno', name: 'Turno', desc: 'Turnover scheduling platform', icon: '🔄', color: '#FF9800', connected: false, apiKey: '' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('klean_integrations');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* use defaults */ }
      }
    }
    return INITIAL_INTEGRATIONS;
  });
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const saveIntegrations = useCallback((updated: Integration[]) => {
    setIntegrations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('klean_integrations', JSON.stringify(updated));
    }
  }, []);

  const handleConnect = useCallback((id: string) => {
    if (!apiKeyInput.trim()) return;
    const updated = integrations.map(i =>
      i.id === id ? { ...i, connected: true, apiKey: apiKeyInput.trim() } : i
    );
    saveIntegrations(updated);
    setConnectingId(null);
    setApiKeyInput('');
  }, [integrations, apiKeyInput, saveIntegrations]);

  const handleDisconnect = useCallback((id: string) => {
    const updated = integrations.map(i =>
      i.id === id ? { ...i, connected: false, apiKey: '' } : i
    );
    saveIntegrations(updated);
  }, [integrations, saveIntegrations]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-sm text-gray-500">Connect your short-term rental platforms to auto-schedule cleaning between guests.</p>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Available Integrations</h2>
        <div className="space-y-3">
          {integrations.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${item.color}15` }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                {item.connected ? (
                  <button
                    onClick={() => handleDisconnect(item.id)}
                    className="rounded-xl bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Connected
                  </button>
                ) : (
                  <button
                    onClick={() => { setConnectingId(item.id); setApiKeyInput(''); }}
                    className="rounded-xl bg-[#AF52DE]/10 px-4 py-1.5 text-sm font-medium text-[#AF52DE] hover:bg-[#AF52DE]/20 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Connect Modal inline */}
              {connectingId === item.id && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-[#F2F2F7] p-3">
                  <label className="mb-1 block text-xs font-semibold text-gray-500">API Key for {item.name}</label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your API key..."
                    className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#AF52DE] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConnectingId(null)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-xs font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConnect(item.id)}
                      disabled={!apiKeyInput.trim()}
                      className="flex-1 rounded-lg bg-[#AF52DE] py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
