import React, { useEffect, useState } from 'react';
import { fetchLikes, removeLike } from '../services/likesService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Likes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLikes();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement.');
    }
    setLoading(false);
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Supprimer ce like ?')) {
      try {
        await removeLike(id);
        setSuccess('Like supprimé.');
        loadLikes();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

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
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') + ' ' + new Date(val).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : '-'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Statistiques des Likes"
          description="Consulter les likes utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des likes..." />
        ) : items.length === 0 ? (
          <EmptyState icon="❤️" title="Aucun like" message="Il n'y a pas encore de likes à afficher." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} />
          </div>
        )}
      </div>
    </div>
  );
}
