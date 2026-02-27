import React, { useEffect, useState } from 'react';
import api from '../config/api';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';

export default function Dashboard() {
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
          users: { total: 0, growth: 0 },
          sports: { total: 0, growth: 0 },
          movies: { total: 0, growth: 0 },
          reportages: { total: 0, growth: 0 },
          reels: { total: 0, growth: 0 },
          divertissements: { total: 0, growth: 0 },
          programs: { total: 0, growth: 0 },
          news: { total: 0, growth: 0 },
          jtandmag: { total: 0, growth: 0 },
          popularPrograms: { total: 0, growth: 0 },
          subscriptions: { total: 0, growth: 0 },
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardData = [
    { key: 'users', label: 'Utilisateurs', color: 'blue' },
    { key: 'sports', label: 'Sports', color: 'red' },
    { key: 'movies', label: 'Films', color: 'purple' },
    { key: 'reportages', label: 'Reportages', color: 'indigo' },
    { key: 'reels', label: 'Reels', color: 'pink' },
    { key: 'divertissements', label: 'Divertissements', color: 'orange' },
    { key: 'programs', label: 'Programmes EPG', color: 'teal' },
    { key: 'news', label: 'Breaking News', color: 'red' },
    { key: 'jtandmag', label: 'JT et Magazines', color: 'yellow' },
    { key: 'popularPrograms', label: 'Programmes Populaires', color: 'green' },
    { key: 'subscriptions', label: 'Abonnements', color: 'green' },
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
                <StatCard
                  key={card.key}
                  label={card.label}
                  value={stats[card.key]?.total || 0}
                  color={card.color}
                  trend={stats[card.key]?.growth}
                />
              ))}
            </div>

            {/* Graphique à barres */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Comparaison Détaillée</h2>
              <div className="space-y-8">
                {cardData.map((card) => {
                  const percentage = maxValue > 0 ? ((stats[card.key]?.total || 0) / maxValue) * 100 : 0;
                  return (
                    <div key={card.key}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{card.label}</span>
                        </div>
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
