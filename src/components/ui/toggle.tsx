"use client";

interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/* Matches iOS UISwitch exactly: 51×31, knob 27×27 */
export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[51px] h-[31px] rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${
        checked ? "bg-[#34C759]" : "bg-[#E5E5EA]"
      }`}
    >
      <div
        className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-[left] duration-200 ${
          checked ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}
