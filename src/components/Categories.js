import { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, SECTIONS } from '../services/categoryService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';

import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

const EMPTY_FORM = {
  section: '',
  name: '',
  is_active: true,
};

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    loadCategories();
  }, [filterSection]);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategories(filterSection || null, false);
      setItems(data || []);
    } catch (e) {
      setError('Erreur lors du chargement des catégories.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.section) {
      setError('Veuillez sélectionner une grande section.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        section: form.section,
        name: form.name,
        is_active: form.is_active,
      };
      if (editId) {
        await updateCategory(editId, payload);
        setSuccess('Catégorie modifiée avec succès.');
      } else {
        await createCategory(payload);
        setSuccess('Catégorie créée avec succès.');
      }
      handleClose();
      loadCategories();
    } catch (e) {
      setError('Erreur : ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item) {
    setForm({
      section: item.section || '',
      name: item.name || '',
      is_active: item.is_active !== false,
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
    setError('');
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      await deleteCategory(itemToDelete.id || itemToDelete._id);
      setSuccess('Catégorie supprimée avec succès.');
      loadCategories();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function getSectionLabel(key) {
    return SECTIONS.find(s => s.key === key)?.label || key;
  }

  const columns = [
    {
      key: 'section',
      label: 'Grande Section',
      render: (val) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {getSectionLabel(val)}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nom',
      render: (val) => <span className="font-medium text-gray-900">{val || '-'}</span>,
    },

    {
      key: 'is_active',
      label: 'Statut',
      render: (val) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          val ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {val ? ' Active' : ' Inactive'}
        </span>
      ),
    },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestion des Catégories"
          description="Sous-catégories rattachées aux grandes sections de BF1"
          action={
            <Button onClick={() => setIsDrawerOpen(true)} variant="primary">
              + Nouvelle Catégorie
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Filtres par section */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterSection('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterSection === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Toutes
          </button>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setFilterSection(s.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterSection === s.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Drawer
          isOpen={isDrawerOpen}
          onClose={handleClose}
          title={editId ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Grande Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grande Section <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setForm({ ...form, section: s.key })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${
                      form.section === s.key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {!form.section && (
                <p className="mt-1 text-xs text-gray-400">Sélectionnez une grande section parente.</p>
              )}
            </div>

            {/* Nom */}
            <FormInput
              label="Nom de la Sous-Catégorie"
              placeholder="13h, LTS, Marathon, Reem Wakato..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />

            {/* Actif */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Catégorie Active (visible dans l'application)
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  editId ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose} disabled={submitting}>
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des catégories..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucune catégorie"
            message="Créez votre première catégorie en sélectionnant une grande section."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={confirmDelete}
        title="Supprimer la Catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${itemToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
