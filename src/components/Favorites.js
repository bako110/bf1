import React, { useEffect, useState } from 'react';
import { fetchFavorites, deleteFavorite } from '../services/favoriteService';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch (e) {
      setError('Erreur chargement favoris');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Supprimer ce favori ?')) {
      await deleteFavorite(id);
      loadFavorites();
    }
  }

  return (
    <div>
      <h2>Gestion des favoris</h2>
      {loading ? <div>Chargement...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Contenu</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map(f => (
              <tr key={f.id}>
                <td>{f.user?.username || 'N/A'}</td>
                <td>{f.content_type} - {f.content_id}</td>
                <td>
                  <button onClick={() => handleDelete(f.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
