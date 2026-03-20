'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: string;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  activeId?: string;
  onItemClick?: (id: string, href?: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({
  items,
  activeId,
  onItemClick,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className = '',
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItem = (item: NavItem, depth = 0) => {
    const isActive = item.id === activeId;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.has(item.id);

    return (
      <div key={item.id}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleGroup(item.id);
            } else {
              onItemClick?.(item.id, item.href);
            }
          }}
          className={`
            w-full flex items-center gap-3 min-h-[44px] px-3 rounded-[12px]
            text-sm font-medium transition-colors
            ${depth > 0 ? 'ml-6' : ''}
            ${isActive ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-[#3C3C43] hover:bg-[#F2F2F7]'}
          `}
        >
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[#FF3B30] text-white">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <svg
                  className={`h-4 w-4 text-[#AEAEB2] transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </>
          )}
        </button>

        <AnimatePresence>
          {hasChildren && isExpanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children!.map((child) => renderItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-[#E5E5EA]
        transition-all duration-200
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${className}
      `}
    >
      {header && (
        <div className="px-4 py-4 border-b border-[#E5E5EA]">{header}</div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => renderItem(item))}
      </div>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mx-3 mb-2 h-[44px] flex items-center justify-center rounded-[12px] hover:bg-[#F2F2F7] transition-colors"
        >
          <svg
            className={`h-5 w-5 text-[#8E8E93] transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {footer && (
        <div className="px-4 py-4 border-t border-[#E5E5EA]">{footer}</div>
      )}
    </aside>
  );
}
