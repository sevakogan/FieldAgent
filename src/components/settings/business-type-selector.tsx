"use client";

import { useState } from "react";
import { SERVICE_CATALOG, BUSINESS_TYPES, type BusinessType } from "@/lib/service-catalog";

interface BusinessTypeSelectorProps {
  readonly currentType: string;
  readonly onConfirm: (newType: BusinessType) => Promise<void>;
  readonly disabled?: boolean;
}

export function BusinessTypeSelector({ currentType, onConfirm, disabled }: BusinessTypeSelectorProps) {
  const [selecting, setSelecting] = useState(false);
  const [pendingType, setPendingType] = useState<BusinessType | null>(null);
  const [confirming, setConfirming] = useState(false);

  const config = SERVICE_CATALOG[currentType as BusinessType] ?? SERVICE_CATALOG.lawn_care;

  if (!selecting) {
    return (
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-lg">{config.icon}</span>
          <span className="bg-gray-100 text-gray-800 text-[12px] font-semibold px-3 py-1.5 rounded-full">
            {config.label}
          </span>
          <button
            type="button"
            onClick={() => setSelecting(true)}
            disabled={disabled}
            className="text-[11px] text-brand-dark font-semibold cursor-pointer hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // Confirmation modal when a new type is picked
  if (pendingType) {
    const pendingConfig = SERVICE_CATALOG[pendingType];
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[13px] font-semibold text-amber-800 mb-1">
          Switch to {pendingConfig.icon} {pendingConfig.label}?
        </p>
        <p className="text-[11px] text-amber-700 mb-3">
          This will replace your current services with the {pendingConfig.label} catalog.
          Custom services you added will be removed.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={confirming}
            onClick={async () => {
              setConfirming(true);
              await onConfirm(pendingType);
              setConfirming(false);
              setPendingType(null);
              setSelecting(false);
            }}
            className="bg-amber-600 text-white rounded-lg px-3 py-1.5 text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {confirming ? "Switching..." : "Confirm"}
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={() => { setPendingType(null); setSelecting(false); }}
            className="text-gray-500 text-[12px] font-semibold cursor-pointer hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Grid of business types
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-3">Select a new business type:</p>
      <div className="grid grid-cols-2 gap-2">
        {BUSINESS_TYPES.map((type) => {
          const typeConfig = SERVICE_CATALOG[type];
          const isCurrent = type === currentType;
          return (
            <button
              key={type}
              type="button"
              disabled={isCurrent}
              onClick={() => setPendingType(type)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-brand-dark/10 border border-brand-dark/30 cursor-default"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{typeConfig.icon}</span>
              <span className="text-[12px] font-semibold">{typeConfig.label}</span>
              {isCurrent && (
                <span className="ml-auto text-[10px] text-brand-dark font-bold">Current</span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setSelecting(false)}
        className="mt-3 text-[12px] text-gray-400 font-semibold cursor-pointer hover:text-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
