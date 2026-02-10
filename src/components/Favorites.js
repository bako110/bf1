import React, { useEffect, useState } from 'react';
import { fetchFavorites, removeFavorite } from '../services/favoritesService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFavorites();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement.');
    }
    setLoading(false);
  }

  /* Fonction de suppression (à activer si nécessaire)
  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Supprimer ce favori ?')) {
      try {
        await removeFavorite(id);
        setSuccess('Favori supprimé.');
        loadFavorites();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }
  */

  const columns = [
    { 
      key: 'user_id', 
      label: 'Utilisateur',
      render: (val) => val ? `Utilisateur ${String(val).substring(0, 8)}...` : 'Inconnu'
    },
    { 
      key: 'content_type', 
      label: 'Type de Contenu',
      render: (val) => {
        const types = {
          'movie': 'Film',
          'show': 'Émission',
          'replay': 'Replay',
          'reel': 'Reel',
          'interview': 'Interview'
        };
        return types[val] || val;
      }
    },
    { 
      key: 'content_id', 
      label: 'Contenu',
      render: (val) => val ? `Contenu ${String(val).substring(0, 8)}...` : '-'
    },
    { 
      key: 'created_at', 
      label: 'Date d\'Ajout',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Statistiques des Favoris"
          description="Consulter les favoris utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des favoris..." />
        ) : items.length === 0 ? (
          <EmptyState icon="⭐" title="Aucun favori" message="Il n'y a pas encore de favoris à afficher." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} />
          </div>
        )}
      </div>
    </div>
  );
}
