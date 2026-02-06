import React, { useEffect, useState } from 'react';
import { fetchComments, deleteComment } from '../services/commentsService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Comments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchComments();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des commentaires.');
    }
    setLoading(false);
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer ce commentaire ?')) {
      try {
        await deleteComment(id);
        setSuccess('Commentaire supprimé.');
        loadComments();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  const columns = [
    { key: 'author', label: 'Auteur', render: (val) => val || 'Anonyme' },
    { key: 'text', label: 'Texte', render: (val, row) => (val || row.content || '').substring(0, 50) + '...' },
    { key: 'content_type', label: 'Type' },
  ];

  const actions = [
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Commentaires"
          description="Modérer et gérer les commentaires utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des commentaires..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="💬"
            title="Aucun commentaire"
            message="Il n'y a pas encore de commentaires à afficher."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={items}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
