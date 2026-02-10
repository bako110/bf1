import React, { useEffect, useState } from 'react';
import { fetchSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '../services/subscriptionPlanService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '',
    name: '',
    duration_months: 1,
    price_cents: 0,
    currency: 'XOF',
    is_active: true
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchSubscriptionPlans(page, itemsPerPage);
      if (append) {
        setPlans(prev => [...prev, ...data.items]);
      } else {
        setPlans(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des plans d\'abonnement.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadPlans(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadPlans(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const planData = {
        ...form,
        duration_months: parseInt(form.duration_months) || 1,
        price_cents: parseInt(form.price_cents) || 0
      };

      if (editId) {
        await updateSubscriptionPlan(editId, planData);
        setSuccess('Plan modifié avec succès.');
      } else {
        await createSubscriptionPlan(planData);
        setSuccess('Plan créé avec succès.');
      }
      handleClose();
      loadPlans();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
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

  function handleEdit(plan) {
    setForm({
      code: plan.code || '',
      name: plan.name || '',
      duration_months: plan.duration_months || 1,
      price_cents: plan.price_cents || 0,
      currency: plan.currency || 'XOF',
      is_active: plan.is_active !== undefined ? plan.is_active : true
    });
    setEditId(plan.id || plan._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      code: '',
      name: '',
      duration_months: 1,
      price_cents: 0,
      currency: 'XOF',
      is_active: true
    });
    setError('');
  }

  const columns = [
    { key: 'name', label: 'Nom du Plan' },
    { key: 'code', label: 'Code' },
    { 
      key: 'duration_months', 
      label: 'Durée',
      render: (val) => `${val} mois`
    },
        { 
      key: 'is_active', 
      label: 'Statut',
      render: (val) => val ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Actif
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ✗ Inactif
        </span>
      )
    }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="💳 Plans d'Abonnement"
          description="Gérer les offres d'abonnement premium de la plateforme"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
              disabled={submitting}
            >
              + Nouveau Plan
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {plans.length > 0 && currentPage < totalPages && (
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
                  Charger plus de plans ({plans.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier le Plan' : '➕ Nouveau Plan'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <p className="text-sm text-purple-800">
                <strong>💡 Astuce :</strong> Le prix est en centimes (ex: 2500 = 25.00 XOF)
              </p>
            </div>

            <FormInput
              label="Code du Plan"
              placeholder="monthly, quarterly, yearly..."
              value={form.code}
              onChange={e => setForm({...form, code: e.target.value})}
              required
              helperText="Code unique pour identifier le plan (ex: monthly, yearly)"
            />

            <FormInput
              label="Nom du Plan"
              placeholder="Premium Mensuel"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Durée (mois)"
                type="number"
                placeholder="1"
                value={form.duration_months}
                onChange={e => setForm({...form, duration_months: e.target.value})}
                required
                min="1"
                max="60"
              />

              <FormInput
                label="Prix (centimes)"
                type="number"
                placeholder="2500"
                value={form.price_cents}
                onChange={e => setForm({...form, price_cents: e.target.value})}
                required
                min="0"
                helperText={`= ${(form.price_cents / 100).toFixed(2)} ${form.currency}`}
              />
            </div>

            <FormInput
              label="Devise"
              placeholder="XOF"
              value={form.currency}
              onChange={e => setForm({...form, currency: e.target.value.toUpperCase()})}
              required
              maxLength={3}
              helperText="Code ISO de la devise (3 lettres)"
            />

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input 
                type="checkbox" 
                id="is_active"
                checked={form.is_active} 
                onChange={e => setForm({...form, is_active: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                ✓ Plan actif et disponible à la vente
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  editId ? '💾 Mettre à jour' : '✨ Créer'
                )}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleClose}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des plans d'abonnement..." />
        ) : plans.length === 0 ? (
          <EmptyState 
            icon="💳"
            title="Aucun plan d'abonnement"
            message="Créez votre premier plan pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <DataTable 
              columns={columns}
              data={plans}
              actions={actions}
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
        type="danger"
      />
    </div>
  );
}
