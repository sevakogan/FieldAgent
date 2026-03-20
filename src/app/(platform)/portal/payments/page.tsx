'use client';

import { useState } from 'react';

const MOCK_CARDS = [
  { id: 'card-1', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
  { id: 'card-2', brand: 'Mastercard', last4: '8888', expiry: '06/27', isDefault: false },
];

const BRAND_COLORS: Record<string, string> = {
  Visa: 'from-blue-600 to-blue-800',
  Mastercard: 'from-orange-500 to-red-600',
};

export default function PaymentsPage() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [autoPay, setAutoPay] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handleSetDefault = (cardId: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === cardId })));
  };

  const handleRemoveCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleAddCard = () => {
    const brand = newCard.number.startsWith('5') ? 'Mastercard' : 'Visa';
    const added = {
      id: `card-${Date.now()}`,
      brand,
      last4: newCard.number.slice(-4) || '0000',
      expiry: newCard.expiry || '01/30',
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, added]);
    setNewCard({ number: '', expiry: '', cvc: '', name: '' });
    setShowAddCard(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>

      {/* Auto-pay toggle */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-900">Auto-Pay</h3>
          <p className="text-sm text-gray-500">Automatically pay invoices when due</p>
        </div>
        <button
          onClick={() => setAutoPay(!autoPay)}
          className={`relative h-7 w-12 rounded-full transition-colors ${autoPay ? 'bg-[#AF52DE]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${autoPay ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
            style={{ transform: autoPay ? 'translateX(22px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className={`rounded-2xl bg-gradient-to-r ${BRAND_COLORS[card.brand] ?? 'from-gray-600 to-gray-800'} p-5 text-white shadow-sm`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium opacity-80">{card.brand}</p>
              {card.isDefault && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">Default</span>
              )}
            </div>
            <p className="mt-4 font-mono text-lg tracking-wider">•••• •••• •••• {card.last4}</p>
            <p className="mt-2 text-sm opacity-80">Exp {card.expiry}</p>
            <div className="mt-3 flex gap-2">
              {!card.isDefault && (
                <button
                  onClick={() => handleSetDefault(card.id)}
                  className="rounded-lg bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleRemoveCard(card.id)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add card */}
      {!showAddCard ? (
        <button
          onClick={() => setShowAddCard(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-medium text-gray-500 hover:border-[#AF52DE] hover:text-[#AF52DE]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Payment Method
        </button>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">Add Card</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Name on Card</label>
              <input
                type="text"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                placeholder="Sarah Miller"
                className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Card Number</label>
              <input
                type="text"
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Expiry</label>
                <input
                  type="text"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">CVC</label>
                <input
                  type="text"
                  value={newCard.cvc}
                  onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                  placeholder="123"
                  maxLength={4}
                  className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCard(false)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 rounded-2xl bg-[#AF52DE] py-3 font-semibold text-white"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
