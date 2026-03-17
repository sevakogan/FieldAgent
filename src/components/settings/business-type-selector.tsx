"use client";

import { useState } from "react";
import { SERVICE_CATALOG, BUSINESS_TYPES, type BusinessType } from "@/lib/service-catalog";

interface BusinessTypeSelectorProps {
  readonly currentType: string;
  readonly onConfirm: (newTypes: BusinessType[]) => Promise<void>;
  readonly disabled?: boolean;
}

function parseBusinessTypes(raw: string): BusinessType[] {
  return raw.split(",").filter((t): t is BusinessType =>
    BUSINESS_TYPES.includes(t as BusinessType)
  );
}

export function BusinessTypeSelector({ currentType, onConfirm, disabled }: BusinessTypeSelectorProps) {
  const [selecting, setSelecting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<BusinessType[]>([]);
  const [confirming, setConfirming] = useState(false);

  const currentTypes = parseBusinessTypes(currentType);

  if (!selecting) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {currentTypes.map((type) => {
            const config = SERVICE_CATALOG[type] ?? SERVICE_CATALOG.lawn_care;
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-[12px] font-semibold px-3 py-1.5 rounded-full"
              >
                <span className="text-sm">{config.icon}</span>
                {config.label}
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedTypes([...currentTypes]);
              setSelecting(true);
            }}
            disabled={disabled}
            className="text-[11px] text-brand-dark font-semibold cursor-pointer hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  const hasChanges =
    selectedTypes.length !== currentTypes.length ||
    selectedTypes.some((t) => !currentTypes.includes(t));

  // Confirmation modal when types differ from current
  if (confirming) {
    const labels = selectedTypes.map((t) => {
      const c = SERVICE_CATALOG[t];
      return `${c.icon} ${c.label}`;
    });

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[13px] font-semibold text-amber-800 mb-1">
          Switch to {labels.join(", ")}?
        </p>
        <p className="text-[11px] text-amber-700 mb-3">
          This will replace your current services with the combined catalog from all selected types.
          Custom services you added will be removed.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasChanges}
            onClick={async () => {
              await onConfirm(selectedTypes);
              setConfirming(false);
              setSelecting(false);
            }}
            className="bg-amber-600 text-white rounded-lg px-3 py-1.5 text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => { setConfirming(false); setSelecting(false); }}
            className="text-gray-500 text-[12px] font-semibold cursor-pointer hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Grid of business types with checkboxes
  const toggleType = (type: BusinessType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-3">Select business types (one or more):</p>
      <div className="grid grid-cols-2 gap-2">
        {BUSINESS_TYPES.map((type) => {
          const typeConfig = SERVICE_CATALOG[type];
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                isSelected
                  ? "bg-brand-dark/10 border-2 border-brand-dark/40"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-brand-dark border-brand-dark"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-base">{typeConfig.icon}</span>
              <span className="text-[12px] font-semibold">{typeConfig.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          disabled={selectedTypes.length === 0}
          onClick={() => setConfirming(true)}
          className="bg-brand-dark text-white rounded-lg px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          Apply ({selectedTypes.length} selected)
        </button>
        <button
          type="button"
          onClick={() => setSelecting(false)}
          className="text-[12px] text-gray-400 font-semibold cursor-pointer hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
