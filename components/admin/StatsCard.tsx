'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  status?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const statusColors = {
  default: 'bg-sand-100 text-sand-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  status = 'default',
  className = '',
}: StatsCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-sand-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-sand-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-sand-900">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-sm ${
                trendUp === undefined
                  ? 'text-sand-500'
                  : trendUp
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}
            >
              {trendUp !== undefined && (
                <span>{trendUp ? '↑' : '↓'} </span>
              )}
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${statusColors[status]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
