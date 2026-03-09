import React, { useEffect, useState } from 'react';
import { fetchSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, initializeDefaultPlans } from '../services/subscriptionPlanService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import ConfirmModal from './ui/ConfirmModal';

// Catégories d'abonnement
const CATEGORIES = [
  { code: 'basic', name: 'Basic', color: 'blue', description: 'Accès premium de base' },
  { code: 'standard', name: 'Standard', color: 'purple', description: 'Accès premium standard' },
  { code: 'premium', name: 'Premium', color: 'yellow', description: 'Accès premium complet' }
];

// Durées disponibles
const DURATIONS = [
  { months: 1, label: '1 mois' },
  { months: 3, label: '3 mois' },
  { months: 12, label: '12 mois' }
];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSubscriptionPlans();
      setPlans(data.items || data || []);
    } catch (e) {
      setError('Erreur lors du chargement des plans d\'abonnement.');
    }
    setLoading(false);
  }

  async function handleInitializeDefaults() {
    setInitializing(true);
    setError('');
    setSuccess('');
    try {
      await initializeDefaultPlans();
      setSuccess('Plans d\'abonnement initialisés avec succès!');
      await loadPlans();
    } catch (e) {
      setError('Erreur lors de l\'initialisation: ' + (e.response?.data?.detail || e.message));
    } finally {
      setInitializing(false);
    }
  }

  function groupPlansByCategory() {
    const grouped = {};
    CATEGORIES.forEach(cat => {
      grouped[cat.code] = {
        ...cat,
        plans: plans.filter(p => p.category === cat.code).sort((a, b) => a.duration_months - b.duration_months)
      };
    });
    return grouped;
  }

  async function handleUpdatePrice(plan) {
    setEditingPlan(plan);
    setIsDrawerOpen(true);
  }

  async function handleSubmitPrice(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    const formData = new FormData(e.target);
    const newPrice = parseInt(formData.get('price'));
    
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Prix invalide');
      setSubmitting(false);
      return;
    }

    try {
      await updateSubscriptionPlan(editingPlan.id || editingPlan._id, {
        price_cents: newPrice * 100 // Convertir en centimes
      });
      setSuccess('Prix mis à jour avec succès.');
      handleClose();
      loadPlans();
    } catch (e) {
      setError('Erreur lors de la mise à jour: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(plan) {
    setError('');
    setSuccess('');
    try {
      await updateSubscriptionPlan(plan.id || plan._id, {
        is_active: !plan.is_active
      });
      setSuccess(`Plan ${plan.is_active ? 'désactivé' : 'activé'}.`);
      loadPlans();
    } catch (e) {
      setError('Erreur lors de la mise à jour.');
    }
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id;
    setError('');
    setSuccess('');
    try {
      await deleteSubscriptionPlan(id);
      setSuccess('Plan supprimé.');
      loadPlans();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditingPlan(null);
    setError('');
  }

  function formatPrice(cents) {
    return (cents / 100).toLocaleString('fr-FR') + ' XOF';
  }

  const groupedPlans = groupPlansByCategory();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Plans d'Abonnement"
          description="Gérer les offres Basic, Standard et Premium avec leurs durées"
          action={
            <Button 
              onClick={handleInitializeDefaults}
              variant="primary"
              disabled={initializing || loading}
            >
              {initializing ? 'Initialisation...' : 'Initialiser les Plans'}
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des plans d'abonnement..." />
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun plan d'abonnement</h3>
            <p className="text-gray-600 mb-6">Initialisez les plans par défaut pour commencer.</p>
            <Button 
              onClick={handleInitializeDefaults}
              variant="primary"
              disabled={initializing}
            >
              {initializing ? 'Initialisation...' : 'Initialiser les Plans'}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const categoryData = groupedPlans[category.code];
              const colorClasses = {
                blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-500' },
                purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-500' },
                yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-500' }
              };
              const colors = colorClasses[category.color];

              return (
                <div key={category.code} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${colors.border}`}>
                  <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors.badge}`}></div>
                        <h3 className={`text-xl font-bold ${colors.text}`}>{category.name}</h3>
                        <span className="text-sm text-gray-600">({category.description})</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {categoryData.plans.length} durée{categoryData.plans.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {categoryData.plans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucun plan configuré pour cette catégorie
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {categoryData.plans.map(plan => (
                          <div key={plan.id || plan._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">
                                  {plan.duration_months} mois
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(plan.price_cents)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {(plan.price_cents / 100 / plan.duration_months).toFixed(0)} XOF/mois
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleActive(plan)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  plan.is_active 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {plan.is_active ? 'Actif' : 'Inactif'}
                              </button>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleUpdatePrice(plan)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                              >
                                Modifier Prix
                              </button>
                              <button
                                onClick={() => handleDelete(plan)}
                                className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer pour modifier le prix */}
      <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={`Modifier le Prix - ${editingPlan?.name}`}>
        <form onSubmit={handleSubmitPrice} className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>Plan:</strong> {editingPlan?.name}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Durée:</strong> {editingPlan?.duration_months} mois
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Prix actuel:</strong> {editingPlan && formatPrice(editingPlan.price_cents)}
            </p>
          </div>

          <FormInput
            label="Nouveau Prix (XOF)"
            type="number"
            name="price"
            placeholder="5000"
            defaultValue={editingPlan ? editingPlan.price_cents / 100 : 0}
            required
            min="0"
            helperText="Entrez le prix en francs XOF (sera automatiquement converti en centimes)"
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour le prix'}
            </Button>
            <Button 
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer le Plan d'Abonnement"
        message={`Êtes-vous sûr de vouloir supprimer le plan "${itemToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
