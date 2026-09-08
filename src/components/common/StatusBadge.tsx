import React from 'react';
import { StatusLevel } from '../../types';

interface StatusBadgeProps {
  status: StatusLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const norm = (status || '').toUpperCase() as StatusLevel;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm === 'SAFE') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'MODERATE') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10';
    dotColor = 'bg-amber-500';
  } else if (norm === 'HIGH') {
    colorClasses = 'bg-orange-50 text-orange-800 border-orange-200/80 ring-orange-500/10';
    dotColor = 'bg-orange-500';
  } else if (norm === 'URGENT') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20 font-semibold shadow-xs';
    dotColor = 'bg-rose-600 animate-pulse';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1 tracking-wide font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      id={`status-badge-${norm.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${colorClasses} ${sizeClasses} whitespace-nowrap`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      <span>{norm}</span>
    </span>
  );
};
