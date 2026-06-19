import React from 'react';
import { capitalize } from '@/utils/helpers';

const colorMap = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  gray:   'bg-gray-100 text-gray-700',
};

export default function Badge({ status, color, label, size = 'sm' }) {
  const c   = color || 'gray';
  const cls = colorMap[c] || colorMap.gray;
  const sz  = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sz} ${cls}`}>
      {label || capitalize(status)}
    </span>
  );
}
