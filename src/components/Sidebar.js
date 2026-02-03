import React from 'react';
import { logoutAdmin } from '../services/authService';

const sections = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Utilisateurs', key: 'users' },
  { label: 'Messagerie', key: 'messages' },
  { label: 'News', key: 'news' },
  { label: 'Émissions', key: 'shows' },
  { label: 'Films', key: 'movies' },
  { label: 'Commentaires', key: 'comments' },
  { label: 'Abonnements', key: 'subscriptions' },
];

export default function Sidebar({ currentSection, onSectionChange }) {
  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-300 min-h-screen flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="bg-black text-white p-6 text-center border-b border-gray-300">
        <div className="text-3xl font-black tracking-wider mb-2">BF1</div>
        <h2 className="text-xs font-semibold uppercase tracking-wide">Administration</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                onClick={() => onSectionChange(s.key)}
                className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                  currentSection === s.key
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-300 p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-800 hover:bg-black text-white py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
