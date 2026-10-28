import React from 'react';
import {
  Briefcase,
  Clock,
  MessageSquare,
  Award,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
} from 'lucide-react';

export const StatsCards = ({ stats, currentFilter, onSelectFilter }) => {
  const cards = [
    {
      key: 'All',
      label: 'Total Applications',
      count: stats?.total ?? 0,
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      activeRing: 'ring-2 ring-indigo-500',
    },
    {
      key: 'Applied',
      label: 'Applied',
      count: stats?.Applied ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      key: 'Interview',
      label: 'Interview',
      count: stats?.Interview ?? 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      activeRing: 'ring-2 ring-purple-500',
    },
    {
      key: 'Offer',
      label: 'Offer',
      count: stats?.Offer ?? 0,
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500',
    },
    {
      key: 'Accepted',
      label: 'Accepted',
      count: stats?.Accepted ?? 0,
      icon: CheckCircle,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      activeRing: 'ring-2 ring-teal-500',
    },
    {
      key: 'Rejected',
      label: 'Rejected',
      count: stats?.Rejected ?? 0,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      activeRing: 'ring-2 ring-rose-500',
    },
    {
      key: 'Declined',
      label: 'Declined',
      count: stats?.Declined ?? 0,
      icon: Ban,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-500',
    },
    {
      key: 'Overdue',
      label: 'Follow-up Overdue',
      count: stats?.overdue ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      activeRing: 'ring-2 ring-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.key === 'Overdue' ? 'Applied' : card.key)}
            className={`flex flex-col text-left p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs hover:shadow-md transition-all cursor-pointer ${
              isActive ? card.activeRing : ''
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wider truncate">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsCards;
