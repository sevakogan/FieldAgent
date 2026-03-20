'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface BottomNavTab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  tabs: BottomNavTab[];
  activeId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function BottomNav({
  tabs,
  activeId,
  onTabChange,
  className = '',
}: BottomNavProps) {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-40 md:hidden
        bg-white/80 backdrop-blur-xl border-t border-[#E5E5EA]
        pb-[env(safe-area-inset-bottom)]
        ${className}
      `}
    >
      <div className="flex items-stretch">
        {tabs.slice(0, 5).map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[50px] pt-1.5 pb-1 relative"
            >
              <motion.span
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`flex items-center justify-center w-6 h-6 ${
                  isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                {tab.icon}
              </motion.span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
