'use client';

import { useState } from 'react';

const MOCK_INTEGRATIONS = [
  { id: 'airbnb', name: 'Airbnb', desc: 'Auto-schedule cleans between guest stays', icon: '🏠', color: '#FF5A5F', connected: true, properties: 2 },
  { id: 'vrbo', name: 'VRBO', desc: 'Sync bookings for turnover cleaning', icon: '🏡', color: '#0E4DA4', connected: true, properties: 1 },
  { id: 'booking', name: 'Booking.com', desc: 'Import reservations automatically', icon: '🅱️', color: '#003580', connected: false, properties: 0 },
  { id: 'guesty', name: 'Guesty', desc: 'Property management integration', icon: '🔑', color: '#1E88E5', connected: false, properties: 0 },
  { id: 'hostaway', name: 'Hostaway', desc: 'Channel manager sync', icon: '📡', color: '#4CAF50', connected: false, properties: 0 },
  { id: 'turno', name: 'Turno', desc: 'Turnover scheduling platform', icon: '🔄', color: '#FF9800', connected: false, properties: 0 },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);

  const handleToggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected, properties: item.connected ? 0 : 1 } : item
      )
    );
  };

  const connected = integrations.filter((i) => i.connected);
  const available = integrations.filter((i) => !i.connected);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-sm text-gray-500">Connect your short-term rental platforms to auto-schedule cleaning between guests.</p>

      {/* Connected */}
      {connected.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Connected</h2>
          <div className="space-y-3">
            {connected.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${item.color}15` }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Connected</span>
                    </div>
                    <p className="text-sm text-gray-500">{item.properties} {item.properties === 1 ? 'property' : 'properties'} synced</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Available</h2>
        <div className="space-y-3">
          {available.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${item.color}15` }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.id)}
                  className="rounded-xl bg-[#AF52DE] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
