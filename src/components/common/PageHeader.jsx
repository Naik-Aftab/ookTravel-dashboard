import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
