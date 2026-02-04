import React, { useEffect, useState } from 'react';
import {
  fetchSubscriptions,
  cancelSubscription,
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from '../services/subscriptionService';
import Drawer from './Drawer';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ code: '', name: '', duration_months: 1, price_cents: 0, currency: 'XOF', is_active: true });
  const [editingPlanId, setEditingPlanId] = useState(null);

  useEffect(() => {
    loadSubs();
    loadPlans();
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

  async function loadPlans() {
    setError('');
    try {
      const data = await fetchSubscriptionPlans(false);
      setPlans(data);
    } catch (e) {
      setError('Erreur chargement tarifs');
    }
  }

  function openCreatePlan() {
    setEditingPlanId(null);
    setPlanForm({ code: '', name: '', duration_months: 1, price_cents: 0, currency: 'XOF', is_active: true });
    setIsPlanDrawerOpen(true);
  }

  function openEditPlan(p) {
    setEditingPlanId(p.id);
    setPlanForm({
      code: p.code || '',
      name: p.name || '',
      duration_months: p.duration_months || 1,
      price_cents: p.price_cents || 0,
      currency: p.currency || 'XOF',
      is_active: !!p.is_active,
    });
    setIsPlanDrawerOpen(true);
  }

  function closePlanDrawer() {
    setIsPlanDrawerOpen(false);
    setEditingPlanId(null);
  }

  async function submitPlan(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingPlanId) {
        await updateSubscriptionPlan(editingPlanId, planForm);
        setSuccess('Tarif modifié avec succès');
      } else {
        await createSubscriptionPlan(planForm);
        setSuccess('Tarif créé avec succès');
      }
      closePlanDrawer();
      loadPlans();
    } catch (err) {
      setError('Erreur lors de la sauvegarde du tarif');
    }
  }

  async function handleDeletePlan(id) {
    if (window.confirm('Supprimer ce tarif ?')) {
      setError('');
      setSuccess('');
      try {
        await deleteSubscriptionPlan(id);
        setSuccess('Tarif supprimé');
        loadPlans();
      } catch (err) {
        setError('Erreur lors de la suppression du tarif');
      }
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Gestion des Abonnements</h2>
              <p className="text-gray-600">Gérer les abonnements des utilisateurs</p>
            </div>
            <button
              onClick={openCreatePlan}
              className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              + Nouveau Tarif
            </button>
          </div>
        </div>

        <Drawer isOpen={isPlanDrawerOpen} onClose={closePlanDrawer} title={editingPlanId ? 'Modifier un Tarif' : 'Nouveau Tarif'}>
          <form onSubmit={submitPlan} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Code</label>
              <input
                value={planForm.code}
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Nom</label>
              <input
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Durée (mois)</label>
                <input
                  type="number"
                  min="1"
                  value={planForm.duration_months}
                  onChange={(e) => setPlanForm({ ...planForm, duration_months: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Prix (centimes)</label>
                <input
                  type="number"
                  min="0"
                  value={planForm.price_cents}
                  onChange={(e) => setPlanForm({ ...planForm, price_cents: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Devise</label>
                <input
                  value={planForm.currency}
                  onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                    className="w-5 h-5 text-black rounded focus:ring-1 focus:ring-black"
                  />
                  <span className="text-sm font-semibold text-black">Actif</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors">
                {editingPlanId ? 'Modifier' : 'Créer'}
              </button>
              <button type="button" onClick={closePlanDrawer} className="bg-gray-300 text-black px-6 py-3 font-semibold hover:bg-gray-400 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </Drawer>

        <div className="bg-white border border-gray-300 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-gray-300 bg-gray-100">
            <h3 className="text-lg font-bold text-black">Tarifs (1 mois, 3 mois, 1 an...)</h3>
            <p className="text-sm text-gray-600">Définir les prix et la durée</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Durée</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Prix</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Aucun tarif</td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-black">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.duration_months} mois</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.price_cents} {p.currency}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 text-xs font-semibold ${
                        p.is_active ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openEditPlan(p)}
                        className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold mr-2 hover:bg-black transition-colors"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
