import React, { useEffect, useState } from 'react';
import { fetchSubscriptions, cancelSubscription } from '../services/subscriptionService';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubs();
  }, []);

  async function loadSubs() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSubscriptions();
      setSubs(data);
    } catch (e) {
      setError('Erreur chargement abonnements');
    }
    setLoading(false);
  }

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

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Gestion des Abonnements</h2>
          <p className="text-gray-600">Gérer les abonnements des utilisateurs</p>
        </div>

        {success && (
          <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Date début</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Date fin</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Aucun abonnement
                    </td>
                  </tr>
                ) : (
                  subs.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{s.user_id || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 text-xs font-semibold ${
                          s.is_active ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {s.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.end_date ? new Date(s.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.is_active && (
                          <button 
                            onClick={() => handleCancel(s.id)} 
                            className="bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-gray-800 transition-colors"
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
