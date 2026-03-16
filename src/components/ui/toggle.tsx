"use client";

interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[42px] h-6 rounded-full shrink-0 transition-colors duration-200 ${
        checked ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <div
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-[left] duration-200 ${
          checked ? "left-[21px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
