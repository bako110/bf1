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
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import EmptyState from './ui/EmptyState';

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

  async function handleDeletePlan(item) {
    const id = item.id || item._id;
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

  const planColumns = [
    { key: 'name', label: 'Nom' },
    { 
      key: 'duration_months', 
      label: 'Durée',
      render: (val) => val + ' mois'
    },
    { 
      key: 'price_cents', 
      label: 'Prix',
      render: (val, row) => val + ' ' + row.currency
    },
    { 
      key: 'is_active', 
      label: 'Statut',
      render: (val) => val ? 'Actif' : 'Inactif'
    }
  ];

  const planActions = [
    { label: 'Modifier', onClick: openEditPlan, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDeletePlan, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

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
          description="Gérer les abonnements et tarifs des utilisateurs"
          action={
            <Button 
              onClick={openCreatePlan}
              variant="primary"
            >
              + Nouveau Tarif
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isPlanDrawerOpen} onClose={closePlanDrawer} title={editingPlanId ? 'Modifier un Tarif' : 'Nouveau Tarif'}>
          <form onSubmit={submitPlan} className="space-y-6">
            <FormInput
              label="Code"
              placeholder="Code unique du tarif"
              value={planForm.code}
              onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
              required
            />
            <FormInput
              label="Nom"
              placeholder="Nom du tarif"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Durée (mois)"
                type="number"
                min="1"
                value={planForm.duration_months}
                onChange={(e) => setPlanForm({ ...planForm, duration_months: Number(e.target.value) })}
              />
              <FormInput
                label="Prix (centimes)"
                type="number"
                min="0"
                value={planForm.price_cents}
                onChange={(e) => setPlanForm({ ...planForm, price_cents: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Devise"
                value={planForm.currency}
                onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value.toUpperCase() })}
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Actif</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth>
                {editingPlanId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="ghost" fullWidth onClick={closePlanDrawer}>
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {/* Plans Section */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarifs (1 mois, 3 mois, 1 an...)</h3>
          {plans.length === 0 ? (
            <EmptyState 
              icon="💰"
              title="Aucun tarif"
              message="Créez votre premier tarif pour le voir apparaître ici."
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <DataTable 
                columns={planColumns}
                data={plans}
                actions={planActions}
              />
            </div>
          )}
        </div>

        {/* Subscriptions Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnements des Utilisateurs</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
