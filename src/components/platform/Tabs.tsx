'use client';

import { motion } from 'framer-motion';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex border-b border-[#E5E5EA] overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`
              relative px-4 min-h-[44px] text-sm font-semibold whitespace-nowrap
              transition-colors flex-shrink-0
              ${isActive ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#3C3C43]'}
            `}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#007AFF] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
