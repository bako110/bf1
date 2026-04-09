import React, { useEffect, useState } from 'react';
import api from '../config/api';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (e) {
        console.error('Dashboard error:', e);
        console.error('Error response:', e.response);
        const errorMsg = e.response?.data?.detail || e.message || 'Erreur lors du chargement des statistiques';
        setError(`Erreur: ${errorMsg}`);
        
        // Fallback avec des valeurs par défaut
        setStats({
          users:          { total: 0, growth: 0 },
          movies:         { total: 0, growth: 0 },
          reportages:     { total: 0, growth: 0 },
          reels:          { total: 0, growth: 0 },
          divertissements:{ total: 0, growth: 0 },
          programs:       { total: 0, growth: 0 },
          news:           { total: 0, growth: 0 },
          jtandmag:       { total: 0, growth: 0 },
          subscriptions:  { total: 0, growth: 0 },
          comments:       { total: 0, growth: 0 },
          likes:          { total: 0, growth: 0 },
          favorites:      { total: 0, growth: 0 },
          sports:         { total: 0, growth: 0 },
          tele_realite:   { total: 0, growth: 0 },
          magazine:       { total: 0, growth: 0 },
          archives:       { total: 0, growth: 0 },
          missed:         { total: 0, growth: 0 },
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardData = [
    { key: 'users',          label: 'Utilisateurs',      color: 'blue',   nav: 'users'           },
    { key: 'sports',         label: 'Sports',            color: 'red',    nav: 'sports'          },
    { key: 'reportages',     label: 'Reportages',        color: 'indigo', nav: 'reportage'       },
    { key: 'reels',          label: 'Reels',             color: 'pink',   nav: 'reel'            },
    { key: 'divertissements',label: 'Divertissements',   color: 'orange', nav: 'divertissement'  },
    { key: 'tele_realite',   label: 'Télé-réalité',      color: 'teal',   nav: 'teleRealite'     },
    { key: 'programs',       label: 'Programmes EPG',    color: 'cyan',   nav: 'programs'        },
    { key: 'news',           label: 'Breaking News',     color: 'red',    nav: 'breakingNews'    },
    { key: 'jtandmag',       label: 'Journal',           color: 'yellow', nav: 'jtandmag'        },
    { key: 'magazine',       label: 'Magazine',          color: 'purple', nav: 'magazine'        },
    { key: 'archives',       label: 'Archives',          color: 'gray',   nav: 'archives'        },
    { key: 'missed',         label: "Vous l'avez raté",  color: 'green',  nav: 'missed'          },
  ];

  const maxValue = stats ? Math.max(...Object.values(stats).map(s => s.total)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Tableau de Bord"
          description="Vue d'ensemble complète de votre plateforme BF1"
        />

        {loading ? (
          <Loader size="lg" text="Chargement des statistiques..." />
        ) : error ? (
          <Alert type="error" title="Erreur" message={error} />
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {cardData.map((card) => (
                <div
                  key={card.key}
                  onClick={() => onNavigate?.(card.nav)}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <StatCard
                    label={card.label}
                    value={stats[card.key]?.total || 0}
                    color={card.color}
                    trend={stats[card.key]?.growth}
                  />
                </div>
              ))}
            </div>

            {/* Graphique à barres */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Comparaison Détaillée</h2>
              <div className="space-y-8">
                {cardData.map((card) => {
                  const percentage = maxValue > 0 ? ((stats[card.key]?.total || 0) / maxValue) * 100 : 0;
                  return (
                    <div
                      key={card.key}
                      onClick={() => onNavigate?.(card.nav)}
                      className="cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-900">{card.label}</span>
                        <span className="text-sm font-bold text-gray-900">{stats[card.key]?.total || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-black h-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
