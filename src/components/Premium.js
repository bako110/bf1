import React, { useEffect, useState } from 'react';
import { fetchPremiumContent, getPremiumOffer } from '../services/premiumService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Premium() {
  const [items, setItems] = useState([]);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPremiumData();
  }, []);

  async function loadPremiumData() {
    setLoading(true);
    setError('');
    try {
      const [contentData, offerData] = await Promise.all([
        fetchPremiumContent(),
        getPremiumOffer()
      ]);
      setItems(contentData);
      setOffer(offerData);
    } catch (e) {
      setError('Erreur lors du chargement des données premium.');
    }
    setLoading(false);
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'content_type', label: 'Type' },
    {
      key: 'id',
      label: 'Statut',
      render: () => (
        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold inline-block">
          Premium
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion Premium"
          description="Gérer le contenu et les offres premium"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des données premium..." />
        ) : (
          <div className="space-y-8">
            {offer && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm p-8 border border-purple-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>👑</span> Offre Premium Actuelle
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Nom de l'offre</p>
                    <p className="text-2xl font-bold text-gray-900">{offer.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Prix</p>
                    <p className="text-4xl font-bold text-purple-600">${offer.price}</p>
                    <p className="text-xs text-gray-500 mt-1">une seule fois</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Durée d'accès</p>
                    <p className="text-2xl font-bold text-gray-900">{offer.duration}<span className="text-sm ml-1">jours</span></p>
                  </div>
                </div>
                {offer.description && (
                  <div className="mt-6 pt-6 border-t border-purple-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                    <p className="text-gray-700 leading-relaxed">{offer.description}</p>
                  </div>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <EmptyState 
                icon="🎬"
                title="Aucun contenu premium"
                message="Aucun contenu premium n'est actuellement disponible."
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📺</span> Contenu Premium
                </h3>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <DataTable 
                    columns={columns}
                    data={items}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
