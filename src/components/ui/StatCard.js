import React from 'react';

export default function StatCard({ label = '', value = 0, trend = null, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    red: 'bg-red-50 text-red-900 border-red-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    pink: 'bg-pink-50 text-pink-900 border-pink-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
    teal: 'bg-teal-50 text-teal-900 border-teal-200',
  };

  return (
    <div className={`border ${colorClasses[color] || colorClasses.blue} p-6 rounded-lg`}>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% ce mois
          </p>
        )}
      </div>
    </div>
  );
}
