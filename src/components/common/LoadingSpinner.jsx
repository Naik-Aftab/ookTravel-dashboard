import React from 'react';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sz = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size] || 'h-8 w-8';

  const spinner = (
    <div className={`${sz} animate-spin rounded-full border-2 border-gray-200 border-t-blue-600`} />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>;
}
