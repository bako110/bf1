import React, { useEffect, useState } from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import { fetchSubscriptionPlans, updateSubscriptionPlan, deleteSubscriptionPlan, initializeDefaultPlans } from '../services/subscriptionPlanService';
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

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
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
      setSuccess('Plans créés avec succès. Les prix des plans existants n\'ont pas été modifiés.');
      await loadPlans();
    } catch (e) {
      setError('Erreur lors de l\'initialisation: ' + extractErrorMessage(e, 'Erreur inconnue'));
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
    setFormPrice(plan.price_cents ? String(plan.price_cents / 100) : '');
    setFormOriginalPrice(plan.original_price_cents ? String(plan.original_price_cents / 100) : '');
    setError('');
    setIsDrawerOpen(true);
  }

  async function handleSubmitPrice(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    const newPrice = parseInt(formPrice);
    const originalPrice = formOriginalPrice ? parseInt(formOriginalPrice) : null;
    
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Prix invalide');
      setSubmitting(false);
      return;
    }

    const patch = { price_cents: newPrice * 100 };
    if (originalPrice !== null) {
      patch.original_price_cents = originalPrice > 0 ? originalPrice * 100 : null;
    }

    try {
      await updateSubscriptionPlan(editingPlan.id || editingPlan._id, patch);
      setSuccess('Prix mis à jour avec succès.');
      handleClose();
      loadPlans();
    } catch (e) {
      setError('Erreur lors de la mise à jour: ' + extractErrorMessage(e, 'Erreur inconnue'));
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
    setFormPrice('');
    setFormOriginalPrice('');
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

        {/* Explication du système de réductions */}
        <div style={{
          background: 'rgba(226,62,62,0.05)', border: '1px solid rgba(226,62,62,0.20)',
          borderLeft: '3px solid #E23E3E', borderRadius: 8, padding: '12px 16px', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E23E3E', marginBottom: 6 }}>Système de réductions automatiques</h3>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#374151', flexWrap: 'wrap' }}>
            <span>📅 <strong>1 mois</strong> — Prix plein</span>
            <span>📅 <strong>3 mois</strong> — −10% (prix barré affiché)</span>
            <span>📅 <strong>12 mois</strong> — −25% (meilleure offre)</span>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Les réductions s'appliquent automatiquement à l'initialisation. Vous pouvez ensuite modifier chaque prix manuellement.</p>
        </div>

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
              const colorMap = {
                blue:   { accent: '#3B82F6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.25)'  },
                purple: { accent: '#9C27B0', bg: 'rgba(156,39,176,0.06)',  border: 'rgba(156,39,176,0.25)'  },
                yellow: { accent: '#FF6F00', bg: 'rgba(255,111,0,0.06)',   border: 'rgba(255,111,0,0.25)'   },
              };
              const cm = colorMap[category.color] ?? colorMap.blue;

              return (
                <div key={category.code} style={{
                  background: '#fff', borderRadius: 12,
                  border: `1.5px solid ${cm.border}`,
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <div style={{
                    background: cm.bg, padding: '14px 20px',
                    borderBottom: `1px solid ${cm.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: cm.accent, display: 'inline-block' }} />
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: cm.accent, margin: 0 }}>{category.name}</h3>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>— {category.description}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
                      {categoryData.plans.length} durée{categoryData.plans.length > 1 ? 's' : ''}
                    </span>
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
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500 mb-1">
                                  {plan.duration_months} mois
                                  <span className="ml-2 text-xs text-gray-400 font-mono">({plan.code})</span>
                                </div>

                                {(() => {
                                  const promo = plan.price_cents;
                                  const orig = plan.original_price_cents;
                                  const promoXof = Math.min(promo, orig || promo);
                                  const origXof = orig ? Math.max(promo, orig) : null;
                                  const hasPromo = orig && orig !== promo;
                                  const pct = hasPromo ? Math.round((1 - promoXof / origXof) * 100) : 0;
                                  return hasPromo ? (
                                    <div className="mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400 line-through">
                                          {formatPrice(origXof)}
                                        </span>
                                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                          -{pct}%
                                        </span>
                                      </div>
                                      <div className="text-2xl font-bold text-red-600">
                                        {formatPrice(promoXof)}
                                      </div>
                                      <div className="text-xs text-green-600 font-medium mt-0.5">
                                        Économie : {formatPrice(origXof - promoXof)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mb-2">
                                      <div className="text-2xl font-bold text-gray-900">
                                        {formatPrice(promo)}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-0.5">Pas de promo</div>
                                    </div>
                                  );
                                })()}

                                <div className="text-xs text-gray-500">
                                  ≈ {(plan.price_cents / 100 / plan.duration_months).toFixed(0)} XOF/mois
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleActive(plan)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
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
                                style={{
                                  flex: 1, padding: '7px 12px', fontSize: 12, fontWeight: 600,
                                  background: '#E23E3E', color: '#fff', border: 'none',
                                  borderRadius: 6, cursor: 'pointer',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#C93535'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#E23E3E'; }}
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
          <div style={{
            background: 'rgba(226,62,62,0.05)', borderLeft: '3px solid #E23E3E',
            borderRadius: 6, padding: '12px 14px',
          }}>
            <p style={{ fontSize: 13, color: '#374151', margin: 0 }}><strong>Plan :</strong> {editingPlan?.name}</p>
            <p style={{ fontSize: 13, color: '#374151', margin: '4px 0 0' }}><strong>Durée :</strong> {editingPlan?.duration_months} mois</p>
            <p style={{ fontSize: 13, color: '#374151', margin: '4px 0 0' }}><strong>Prix actuel :</strong> {editingPlan && formatPrice(editingPlan.price_cents)}</p>
          </div>

          <FormInput
            label="Prix promo / normal (XOF)"
            type="number"
            name="price"
            placeholder="1000"
            value={formPrice}
            onChange={e => setFormPrice(e.target.value)}
            required
            min="0"
            helperText="Prix affiché à l'utilisateur (prix réel si pas de promo)"
          />

          <FormInput
            label="Prix original barré (XOF) — optionnel"
            type="number"
            name="original_price"
            placeholder="2000"
            value={formOriginalPrice}
            onChange={e => setFormOriginalPrice(e.target.value)}
            min="0"
            helperText="Laissez vide pour supprimer la promo. Doit être supérieur au prix promo."
          />

          {/* Prévisualisation du % */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            ℹ️ Si vous mettez Prix = 800, Prix barré = 1000 &rarr; affiche « -20% · Économisez 200 FCFA » sur l'app mobile.
          </div>

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
