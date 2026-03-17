"use client";

import { useState } from "react";

interface EditablePriceProps {
  readonly price: number;
  readonly onSave: (newPrice: number) => void;
}

export function EditablePrice({ price, onSave }: EditablePriceProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price / 100));

  if (!editing) {
    return (
      <span
        className="text-[13px] font-medium cursor-pointer hover:text-brand-dark transition-colors"
        onClick={() => { setValue(String(price / 100)); setEditing(true); }}
      >
        ${(price / 100).toFixed(0)}
      </span>
    );
  }

  return (
    <input
      type="number"
      min="0"
      step="1"
      className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[13px] outline-none focus:border-gray-400 transition-colors"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const cents = Math.round(parseFloat(value) * 100);
        if (!isNaN(cents) && cents > 0) {
          onSave(cents);
        }
        setEditing(false);
      }}
      autoFocus
    />
  );
}

interface EditableNameProps {
  readonly name: string;
  readonly onSave: (newName: string) => void;
}

export function EditableName({ name, onSave }: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  if (!editing) {
    return (
      <span
        className="font-semibold text-[13px] cursor-pointer hover:text-brand-dark transition-colors"
        onClick={() => { setValue(name); setEditing(true); }}
      >
        {name}
      </span>
    );
  }

  return (
    <input
      type="text"
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[13px] font-semibold outline-none focus:border-gray-400 transition-colors"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== name) {
          onSave(trimmed);
        }
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
          setValue(name);
          setEditing(false);
        }
      }}
      autoFocus
    />
  );
}

interface ServiceRowProps {
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly isActive: boolean;
  readonly onToggle: () => void;
  readonly onUpdatePrice: (newPrice: number) => void;
  readonly onUpdateName: (newName: string) => void;
  readonly onDelete: () => void;
}

export function ServiceRow({
  name,
  category,
  price,
  isActive,
  onToggle,
  onUpdatePrice,
  onUpdateName,
  onDelete,
}: ServiceRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 group">
      <div className="flex-1 min-w-0 mr-3">
        <EditableName name={name} onSave={onUpdateName} />
        <div className="text-[11px] text-gray-400">{category}</div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <EditablePrice price={price} onSave={onUpdatePrice} />
        <button
          type="button"
          onClick={onToggle}
          className="text-lg cursor-pointer transition-opacity hover:opacity-70"
          title={isActive ? "Active — click to hide" : "Hidden — click to show"}
        >
          {isActive ? (
            <span className="opacity-90">👁</span>
          ) : (
            <span className="opacity-30 line-through">👁</span>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-base cursor-pointer opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
          title="Delete service"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
