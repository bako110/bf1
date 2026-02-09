import React, { useEffect, useState } from 'react';
import {
  fetchSubscriptions,
  cancelSubscription,
} from '../services/subscriptionService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSubs();
  }, []);

  async function loadSubs(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchSubscriptions(page, itemsPerPage);
      if (append) {
        setSubs(prev => [...prev, ...data.items]);
      } else {
        setSubs(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur chargement abonnements');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadSubs(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadSubs(currentPage + 1, true);
    }
  };

  async function handleCancel(id) {
    if (window.confirm('Annuler cet abonnement ?')) {
      try {
        await cancelSubscription(id);
        setSuccess('Abonnement annulé avec succès');
        loadSubs();
      } catch (e) {
        setError('Erreur lors de l\'annulation');
      }
    }
  }

  
  const subscriptionColumns = [
    { key: 'user_id', label: 'Utilisateur' },
    { key: 'email', label: 'Email' },
    { 
      key: 'is_active', 
      label: 'Statut',
      render: (val) => val ? 'Actif' : 'Inactif'
    },
    { 
      key: 'start_date', 
      label: 'Date début',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : 'N/A'
    },
    { 
      key: 'end_date', 
      label: 'Date fin',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : 'N/A'
    }
  ];

  const subscriptionActions = [
    { 
      label: 'Annuler', 
      onClick: (item) => item.is_active && handleCancel(item.id), 
      className: 'text-red-600 hover:text-red-800 font-medium text-sm',
      shouldShow: (item) => item.is_active
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Abonnements"
          description="Consulter et gérer les abonnements des utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        
        {/* Subscriptions Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnements des Utilisateurs</h3>
          
          {/* Bouton charger plus */}
          {subs.length > 0 && currentPage < totalPages && (
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
                    Charger plus d'abonnements ({subs.length}/{totalItems})
                  </>
                )}
              </button>
            </div>
          )}
          
          {loading ? (
            <Loader size="lg" text="Chargement des abonnements..." />
          ) : subs.length === 0 ? (
            <EmptyState 
              icon="📋"
              title="Aucun abonnement"
              message="Aucun abonnement en attente."
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <DataTable 
                columns={subscriptionColumns}
                data={subs}
                actions={subscriptionActions}
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
    </div>
  );
}
