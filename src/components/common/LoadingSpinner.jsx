import React from 'react';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sz = { sm: 'h-5 w-5', md: 'h-9 w-9', lg: 'h-14 w-14' }[size] || 'h-9 w-9';

  const spinner = (
    <div className={`${sz} animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600`} />
  );

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        {spinner}
        <p className="text-sm text-gray-400 font-medium animate-pulse">Loading…</p>
      </div>
    );
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>;
}
