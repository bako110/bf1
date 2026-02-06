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
        const [users, news, shows, movies, comments, subscriptions, likes, favorites] = await Promise.all([
          api.get('/users'),
          api.get('/news'),
          api.get('/shows'),
          api.get('/movies'),
          api.get('/comments'),
          api.get('/subscriptions'),
          api.get('/likes'),
          api.get('/favorites'),
        ]);
        setStats({
          users: users.data.length,
          news: news.data.length,
          shows: shows.data.length,
          movies: movies.data.length,
          comments: comments.data.length,
          subscriptions: subscriptions.data.length,
          likes: likes.data.length,
          favorites: favorites.data.length,
        });
      } catch (e) {
        setError('Erreur lors du chargement des statistiques');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardData = [
    { key: 'users', label: 'Utilisateurs', icon: '👥', color: 'blue' },
    { key: 'news', label: 'News', icon: '📰', color: 'purple' },
    { key: 'shows', label: 'Émissions', icon: '📺', color: 'red' },
    { key: 'movies', label: 'Films', icon: '🎬', color: 'yellow' },
    { key: 'comments', label: 'Commentaires', icon: '💬', color: 'blue' },
    { key: 'subscriptions', label: 'Abonnements', icon: '💳', color: 'green' },
    { key: 'likes', label: 'Likes', icon: '❤️', color: 'red' },
    { key: 'favorites', label: 'Favoris', icon: '⭐', color: 'yellow' },
  ];

  const maxValue = stats ? Math.max(...Object.values(stats)) : 0;

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
                  value={stats[card.key]}
                  icon={card.icon}
                  color={card.color}
                  trend={Math.floor(Math.random() * 20) - 5}
                />
              ))}
            </div>

            {/* Graphique à barres */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Comparaison Détaillée</h2>
              <div className="space-y-8">
                {cardData.map((card) => {
                  const percentage = maxValue > 0 ? (stats[card.key] / maxValue) * 100 : 0;
                  return (
                    <div key={card.key}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{card.icon}</span>
                          <span className="text-sm font-semibold text-gray-900">{card.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{stats[card.key]}</span>
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
