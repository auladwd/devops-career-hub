'use client';

import React from 'react';
import { ApplicationStatus } from '@/lib/types';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants/bengali';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  short?: boolean;
}

export function StatusBadge({ status, className, short = false }: StatusBadgeProps) {
  const color = APPLICATION_STATUS_COLORS[status] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
  };

  const label = APPLICATION_STATUS_LABELS[status] || status;
  const displayLabel = short ? label.split(' ')[0] : label;

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 leading-none whitespace-nowrap',
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
