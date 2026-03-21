'use client'

import { type ReactNode } from 'react'

type BadgeVariant =
  | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow'
  | 'mint' | 'slate' | 'pink'
  // Semantic aliases
  | 'scheduled' | 'in_progress' | 'completed' | 'pending' | 'failed'
  | 'cancelled' | 'active' | 'inactive' | 'online' | 'offline'
  | 'pending_review' | 'charged' | 'driving' | 'arrived'
  | 'requested' | 'approved' | 'revision_needed'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  icon?: ReactNode
  dot?: boolean
  className?: string
  size?: 'sm' | 'md'
}

const BADGE_STYLES: Record<string, { bg: string; text: string; dot?: string }> = {
  // Colors
  blue:    { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', dot: 'bg-[#007AFF]' },
  green:   { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', dot: 'bg-[#34C759]' },
  orange:  { bg: 'bg-[#FF9F0A]/12', text: 'text-[#CC7F08]', dot: 'bg-[#FF9F0A]' },
  red:     { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', dot: 'bg-[#FF3B30]' },
  purple:  { bg: 'bg-[#AF52DE]/10', text: 'text-[#AF52DE]', dot: 'bg-[#AF52DE]' },
  yellow:  { bg: 'bg-[#FFD60A]/15', text: 'text-[#B8860B]', dot: 'bg-[#FFD60A]' },
  mint:    { bg: 'bg-[#5AC8FA]/10', text: 'text-[#2E8EB8]', dot: 'bg-[#5AC8FA]' },
  slate:   { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', dot: 'bg-[#8E8E93]' },
  pink:    { bg: 'bg-[#FF2D55]/10', text: 'text-[#FF2D55]', dot: 'bg-[#FF2D55]' },

  // Semantic — job statuses
  scheduled:       { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', dot: 'bg-[#007AFF]' },
  in_progress:     { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', dot: 'bg-[#007AFF]' },
  driving:         { bg: 'bg-[#5AC8FA]/10', text: 'text-[#2E8EB8]', dot: 'bg-[#5AC8FA]' },
  arrived:         { bg: 'bg-[#FF9F0A]/12', text: 'text-[#CC7F08]', dot: 'bg-[#FF9F0A]' },
  completed:       { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', dot: 'bg-[#34C759]' },
  charged:         { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', dot: 'bg-[#34C759]' },
  pending:         { bg: 'bg-[#FF9F0A]/12', text: 'text-[#CC7F08]', dot: 'bg-[#FF9F0A]' },
  pending_review:  { bg: 'bg-[#AF52DE]/10', text: 'text-[#AF52DE]', dot: 'bg-[#AF52DE]' },
  revision_needed: { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', dot: 'bg-[#FF3B30]' },
  failed:          { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', dot: 'bg-[#FF3B30]' },
  cancelled:       { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', dot: 'bg-[#8E8E93]' },
  requested:       { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', dot: 'bg-[#8E8E93]' },
  approved:        { bg: 'bg-[#5AC8FA]/10', text: 'text-[#2E8EB8]', dot: 'bg-[#5AC8FA]' },

  // Semantic — entity statuses
  active:   { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', dot: 'bg-[#34C759]' },
  inactive: { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', dot: 'bg-[#8E8E93]' },
  online:   { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', dot: 'bg-[#34C759]' },
  offline:  { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', dot: 'bg-[#8E8E93]' },
}

const STATUS_ICONS: Record<string, string> = {
  in_progress: '◌',
  completed: '◉',
  pending: '◷',
  failed: '⊗',
  online: '●',
  scheduled: '◷',
  driving: '→',
  arrived: '◎',
  charged: '✓',
  pending_review: '◌',
  cancelled: '✕',
  active: '●',
  inactive: '○',
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  revision_needed: 'Revision Needed',
  per_job: 'Per Job',
}

export function Badge({
  variant = 'blue',
  children,
  icon,
  dot = false,
  className = '',
  size = 'sm',
}: BadgeProps) {
  const style = BADGE_STYLES[variant] ?? BADGE_STYLES.slate
  const defaultIcon = STATUS_ICONS[variant]
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${style.bg} ${style.text}
        ${sizeClass}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {icon ? (
        <span className="flex-shrink-0 flex items-center text-[0.85em]">{icon}</span>
      ) : defaultIcon && !dot ? (
        <span className="text-[0.85em] opacity-70">{defaultIcon}</span>
      ) : null}
      {children}
    </span>
  )
}

/** Convenience: auto-labels and colors from a status string */
export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const label = STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  const variant = (status in BADGE_STYLES ? status : 'slate') as BadgeVariant

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
