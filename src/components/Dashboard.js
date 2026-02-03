import React, { useEffect, useState } from 'react';
import api from '../config/api';

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
        setError('Erreur chargement statistiques');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardData = [
    { key: 'users', label: 'Utilisateurs' },
    { key: 'news', label: 'News' },
    { key: 'shows', label: 'Émissions' },
    { key: 'movies', label: 'Films' },
    { key: 'comments', label: 'Commentaires' },
    { key: 'subscriptions', label: 'Abonnements' },
    { key: 'likes', label: 'Likes' },
    { key: 'favorites', label: 'Favoris' },
  ];

  const maxValue = stats ? Math.max(...Object.values(stats)) : 0;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre plateforme BF1</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : error ? (
          <div className="bg-gray-50 border border-gray-300 p-6">
            <span className="text-gray-800">{error}</span>
          </div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {cardData.map((card) => (
                <div
                  key={card.key}
                  className="bg-white border border-gray-300 p-6 hover:border-black transition-colors"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {card.label}
                  </h3>
                  <div className="text-4xl font-bold text-black">{stats[card.key]}</div>
                </div>
              ))}
            </div>

            {/* Graphique à barres */}
            <div className="bg-white border border-gray-300 p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Statistiques Détaillées</h2>
              <div className="space-y-6">
                {cardData.map((card) => {
                  const percentage = maxValue > 0 ? (stats[card.key] / maxValue) * 100 : 0;
                  return (
                    <div key={card.key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                        <span className="text-sm font-bold text-black">{stats[card.key]}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-8 relative overflow-hidden">
                        <div 
                          className="bg-black h-full transition-all duration-500 ease-out flex items-center justify-end pr-3"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 10 && (
                            <span className="text-white text-xs font-semibold">{Math.round(percentage)}%</span>
                          )}
                        </div>
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
