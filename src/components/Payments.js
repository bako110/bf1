import React, { useEffect, useState } from 'react';
import { getPaymentMethods } from '../services/paymentsService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import EmptyState from './ui/EmptyState';

export default function Payments() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadPaymentMethods() {
    setLoading(true);
    setError('');
    try {
      const data = await getPaymentMethods();
      setMethods(data.methods || []);
    } catch (e) {
      setError('Erreur lors du chargement des méthodes de paiement.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Paiements"
          description="Gérer les méthodes de paiement disponibles"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des méthodes de paiement..." />
        ) : methods.length === 0 ? (
          <EmptyState 
            icon="💳"
            title="Aucune méthode de paiement"
            message="Aucune méthode de paiement n'est actuellement disponible."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <div key={method.id} className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: {method.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-semibold text-xs ${method.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {method.available ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {method.available ? '✓ Accepte les paiements' : '✗ Paiements désactivés'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
