import React, { useEffect, useState } from 'react';
import { fetchLikes, deleteLike } from '../services/likeService';

export default function Likes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    setLoading(true);
    try {
      const data = await fetchLikes();
      setLikes(data);
    } catch (e) {
      setError('Erreur chargement likes');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Supprimer ce like ?')) {
      await deleteLike(id);
      loadLikes();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-6">Gestion des Likes</h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-800">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-4 animate-spin">●</div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contenu ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {likes.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{l.username || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{l.content_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{l.content_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => handleDelete(l.id)} 
                        className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-900 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
