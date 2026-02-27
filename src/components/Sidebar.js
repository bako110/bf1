import React from 'react';
import { logoutAdmin } from '../services/authService';

const sections = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Utilisateurs', key: 'users' },
  { label: 'Contenu', key: 'submenu_content', isHeader: true },
  { label: 'Contrôle Live', key: 'liveControl' },
  { label: 'Calendrier', key: 'programs' },
  { label: 'Catégories', key: 'categories' },
  { label: 'Sports', key: 'sports' },
  { label: 'JT et Magazines', key: 'jtandmag' },
  { label: 'Flash info', key: 'breakingNews' },
  { label: 'Films', key: 'movies' },
  { label: 'Reportages', key: 'reportage' },
  { label: 'Reel', key: 'reel' },
  { label: 'Divertissements', key: 'divertissement' },
  { label: 'Archives', key: 'archives' },
  // { label: 'Engagement', key: 'submenu_engagement', isHeader: true },
  // { label: 'Commentaires', key: 'comments' },
  // { label: 'Likes', key: 'likes' },
  // { label: 'Favoris', key: 'favorites' },
  { label: 'Messagerie', key: 'messages' },
  { label: 'Abonnements', key: 'submenu_subscriptions', isHeader: true },
  { label: 'Plans d\'Abonnement', key: 'subscriptionPlans' },
  { label: 'Abonnements Utilisateurs', key: 'subscriptions' },
  { label: 'Paiements', key: 'payments' },
  { label: 'Système', key: 'submenu_system', isHeader: true },
  { label: 'Contact', key: 'contact' },
  { label: 'Paramètres', key: 'settings' },
];

export default function Sidebar({ currentSection, onSectionChange, onLogout }) {
  const handleLogout = () => {
    logoutAdmin();
    if (onLogout) onLogout();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-300 min-h-screen flex flex-col fixed left-0 top-0" style={{maxHeight: '100vh', overflowY: 'auto'}}>
      {/* Header */}
      <div className="bg-white p-6 text-center border-b border-gray-300">
        <div className="text-3xl font-black tracking-wider mb-2 text-black">BF1</div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Administration</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sections.map((s) => {
            if (s.isHeader) {
              return (
                <li key={s.key} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white bg-gray-800 mt-6 mb-2 border-l-4 border-black">
                  {s.label}
                </li>
              );
            }
            return (
              <li key={s.key}>
                <button
                  onClick={() => onSectionChange(s.key)}
                  className={`w-full text-left px-6 py-3 text-sm font-medium transition-all ${
                    currentSection === s.key
                      ? 'bg-black text-white border-l-4 border-black font-semibold'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-400'
                  }`}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-300 p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
