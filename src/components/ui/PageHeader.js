import React from 'react';

export default function PageHeader({ title = '', description = '', action = null }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
