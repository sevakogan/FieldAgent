'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColor(name: string): string {
  const colors = [
    '#007AFF',
    '#AF52DE',
    '#5AC8FA',
    '#FF9F0A',
    '#FF6B6B',
    '#FF2D55',
    '#34C759',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={`
        relative rounded-full overflow-hidden flex items-center justify-center
        font-semibold flex-shrink-0
        ${sizeClasses[size]}
        ${className}
      `}
      style={!showImage ? { backgroundColor: getColor(name) } : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-white">{getInitials(name) || '?'}</span>
      )}
    </div>
  );
}
