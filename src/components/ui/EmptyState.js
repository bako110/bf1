import React from 'react';

export default function EmptyState({ icon = '📋', title = 'Aucune donnée', message = 'Il n\'y a rien à afficher pour le moment.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl mb-4">{icon}</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-xs">{message}</p>
    </div>
  );
}
