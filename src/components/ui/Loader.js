import React from 'react';

export default function Loader({ size = 'md', text = 'Chargement...' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-black rounded-full animate-spin`}></div>
      {text && <p className="text-gray-600 mt-4 text-sm font-medium">{text}</p>}
    </div>
  );
}
