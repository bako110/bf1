import React from 'react';
import { logoutAdmin } from '../services/authService';

const sections = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Utilisateurs', key: 'users' },
  { label: 'Contenu', key: 'submenu_content', isHeader: true },
  { label: 'Émissions', key: 'shows' },
  { label: 'Breaking News', key: 'breakingNews' },
  { label: 'Films', key: 'movies' },
  { label: 'Replay', key: 'replay' },
  { label: 'Programmes Populaires', key: 'popularPrograms' },
  { label: 'Reel', key: 'reel' },
  { label: 'Interview', key: 'interview' },
  { label: 'Trending Show', key: 'trendingShow' },
  { label: 'Engagement', key: 'submenu_engagement', isHeader: true },
  { label: 'Commentaires', key: 'comments' },
  { label: 'Favoris', key: 'favorites' },
  { label: 'Likes', key: 'likes' },
  { label: 'Messagerie', key: 'messages' },
  // { label: 'Notifications', key: 'notifications' },
  { label: 'Système', key: 'submenu_system', isHeader: true },
  { label: 'Programmes (EPG)', key: 'programs' },
  { label: 'Abonnements', key: 'subscriptions' },
  { label: 'Plans d\'Abonnement', key: 'subscriptionPlans' },
  // { label: 'Premium', key: 'premium' },
  { label: 'Paiements', key: 'payments' },
  // { label: 'Uploads', key: 'uploads' },
  { label: 'Contact', key: 'contact' },
  { label: 'Paramètres', key: 'settings' },
];

export default function Sidebar({ currentSection, onSectionChange }) {
  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-300 min-h-screen flex flex-col fixed left-0 top-0" style={{maxHeight: '100vh', overflowY: 'auto'}}>
      {/* Header */}
      <div className="bg-black text-white p-6 text-center border-b border-gray-300">
        <div className="text-3xl font-black tracking-wider mb-2">BF1</div>
        <h2 className="text-xs font-semibold uppercase tracking-wide">Administration</h2>
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
          className="w-full bg-white text-black border border-black py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
