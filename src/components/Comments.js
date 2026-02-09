import React, { useEffect, useState } from 'react';
import { fetchComments } from '../services/commentsService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';

export default function Comments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchComments(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des commentaires.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadComments(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadComments(currentPage + 1, true);
    }
  };

  
  const columns = [
    { 
      key: 'username', 
      label: 'Utilisateur',
      render: (val) => val || 'Anonyme'
    },
    { 
      key: 'text', 
      label: 'Commentaire', 
      render: (val) => {
        const str = String(val || '');
        return str.length > 80 ? str.substring(0, 80) + '...' : str;
      }
    },
    { 
      key: 'content_type', 
      label: 'Type de Contenu',
      render: (val) => {
        const types = {
          'movie': 'Film',
          'show': 'Émission',
          'replay': 'Replay',
          'reel': 'Reel'
        };
        return types[val] || String(val);
      }
    },
    { 
      key: 'is_hidden', 
      label: 'Statut',
      render: (val) => val ? '❌ Masqué' : '✅ Visible'
    },
    { 
      key: 'created_at', 
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Statistiques des Commentaires"
          description="Consulter les commentaires utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {items.length > 0 && currentPage < totalPages && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleLoadMore}
              disabled={paginationLoading}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paginationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>
                  Charger plus de commentaires ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

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
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              hasNextPage={currentPage < totalPages}
              hasPrevPage={currentPage > 1}
              loading={paginationLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
