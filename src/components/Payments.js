import React, { useEffect, useState } from 'react';
import { fetchAllPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethod } from '../services/paymentsService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';

export default function Payments() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    icon_url: '',
    is_active: true,
    order: 0,
    min_amount: '',
    max_amount: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadPaymentMethods() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllPaymentMethods();
      setMethods(data || []);
    } catch (e) {
      setError('Erreur lors du chargement des méthodes de paiement.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        min_amount: form.min_amount ? parseFloat(form.min_amount) : null,
        max_amount: form.max_amount ? parseFloat(form.max_amount) : null
      };
      
      if (editId) {
        await updatePaymentMethod(editId, payload);
        setSuccess('Méthode de paiement modifiée avec succès.');
      } else {
        await createPaymentMethod(payload);
        setSuccess('Méthode de paiement créée avec succès.');
      }
      handleClose();
      loadPaymentMethods();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Supprimer cette méthode de paiement ?')) {
      try {
        await deletePaymentMethod(id);
        setSuccess('Méthode de paiement supprimée.');
        loadPaymentMethods();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  async function handleToggle(item) {
    const id = item.id || item._id;
    try {
      await togglePaymentMethod(id);
      setSuccess(`Méthode ${item.is_active ? 'désactivée' : 'activée'} avec succès.`);
      loadPaymentMethods();
    } catch (e) {
      setError('Erreur lors de la modification.');
    }
  }

  function handleEdit(item) {
    setForm({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      icon_url: item.icon_url || '',
      is_active: item.is_active !== undefined ? item.is_active : true,
      order: item.order || 0,
      min_amount: item.min_amount || '',
      max_amount: item.max_amount || ''
    });
    setEditId(item.id || item._id);
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
      description: '',
      icon_url: '',
      is_active: true,
      order: 0,
      min_amount: '',
      max_amount: ''
    });
    setError('');
  }

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'code', label: 'Code' },
    { 
      key: 'is_active', 
      label: 'Statut',
      render: (val) => val ? '✅ Actif' : '❌ Inactif'
    },
    { 
      key: 'min_amount', 
      label: 'Montant Min',
      render: (val) => val ? `${val} FCFA` : '-'
    },
    { 
      key: 'max_amount', 
      label: 'Montant Max',
      render: (val) => val ? `${val} FCFA` : '-'
    },
    { key: 'order', label: 'Ordre' }
  ];

  const actions = [
    { 
      label: (item) => item.is_active ? 'Désactiver' : 'Activer', 
      onClick: handleToggle, 
      className: (item) => item.is_active ? 'text-orange-600 hover:text-orange-800 font-medium text-sm' : 'text-green-600 hover:text-green-800 font-medium text-sm'
    },
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Méthodes de Paiement"
          description="Créer et gérer les méthodes de paiement disponibles"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
              disabled={submitting}
            >
              + Nouvelle Méthode
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier la Méthode' : '➕ Nouvelle Méthode'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>💡 Astuce :</strong> Configurez les méthodes de paiement acceptées par votre plateforme.
              </p>
            </div>

            <FormInput
              label="Code"
              placeholder="orange"
              value={form.code}
              onChange={e => setForm({...form, code: e.target.value})}
              required
              helperText="Code unique (ex: orange, mtn, intouch)"
            />

            <FormInput
              label="Nom"
              placeholder="Orange Money"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />

            <FormTextarea
              label="Description"
              placeholder="Paiement via Orange Money..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
            />

            <FormInput
              label="URL de l'Icône"
              placeholder="https://exemple.com/icon.png"
              value={form.icon_url}
              onChange={e => setForm({...form, icon_url: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Montant Minimum (FCFA)"
                type="number"
                placeholder="100"
                value={form.min_amount}
                onChange={e => setForm({...form, min_amount: e.target.value})}
                min="0"
              />

              <FormInput
                label="Montant Maximum (FCFA)"
                type="number"
                placeholder="1000000"
                value={form.max_amount}
                onChange={e => setForm({...form, max_amount: e.target.value})}
                min="0"
              />
            </div>

            <FormInput
              label="Ordre d'Affichage"
              type="number"
              placeholder="0"
              value={form.order}
              onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
              min="0"
              helperText="Ordre d'affichage dans la liste (0 = premier)"
            />

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Méthode active et disponible pour les utilisateurs
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
          <Loader size="lg" text="Chargement des méthodes de paiement..." />
        ) : methods.length === 0 ? (
          <EmptyState 
            icon="💳"
            title="Aucune méthode de paiement"
            message="Créez votre première méthode de paiement pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <DataTable 
              columns={columns}
              data={methods}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
