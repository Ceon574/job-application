import React from 'react';
import { AlertCircle } from 'lucide-react';

export const OverdueBadge = ({ size = 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title="Overdue: More than 7 days have passed since application without follow-up."
    >
      <AlertCircle className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>Follow-up Overdue</span>
    </span>
  );
};

export default OverdueBadge;
