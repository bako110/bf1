import React from 'react';

export default function Alert({ type = 'info', title = '', message = '', onClose = null }) {
  const typeClasses = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };

  const iconClasses = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`border ${typeClasses[type]} p-4 rounded-lg mb-6 flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold">{iconClasses[type]}</span>
        <div>
          {title && <p className="font-semibold text-sm">{title}</p>}
          <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg font-bold cursor-pointer hover:opacity-70">
          ✕
        </button>
      )}
    </div>
  );
}
