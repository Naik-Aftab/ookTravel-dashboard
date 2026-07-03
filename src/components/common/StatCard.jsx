import React from 'react';

const colorConfig = {
  blue:   { gradient: 'from-blue-500 to-blue-600',       ring: 'ring-blue-100' },
  green:  { gradient: 'from-emerald-500 to-green-600',   ring: 'ring-green-100' },
  yellow: { gradient: 'from-amber-400 to-yellow-500',    ring: 'ring-amber-100' },
  red:    { gradient: 'from-red-500 to-rose-600',        ring: 'ring-red-100' },
  purple: { gradient: 'from-purple-500 to-violet-600',   ring: 'ring-purple-100' },
  indigo: { gradient: 'from-indigo-500 to-blue-600',     ring: 'ring-indigo-100' },
  orange: { gradient: 'from-orange-400 to-amber-500',    ring: 'ring-orange-100' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const c = colorConfig[color] || colorConfig.blue;

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${c.gradient} ring-4 ${c.ring} shadow-sm`}>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-500 mt-1 leading-snug">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
