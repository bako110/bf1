import React, { useEffect, useState } from 'react';
import { fetchEmissionCategories, createEmissionCategory, updateEmissionCategory, deleteEmissionCategory } from '../services/emissionCategoryService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import ImageUpload from './ui/ImageUpload';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

export default function EmissionCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    image_main: '',
    image_background: '',
    image_icon: '',
    order: 0,
    is_active: true
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEmissionCategories();
      setCategories(data || []);
    } catch (e) {
      setError('Erreur lors du chargement des catégories.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    setSubmitting(true);
    
    try {
      const categoryData = {
        name: form.name,
        image_main: form.image_main || null,
        image_background: form.image_background || null,
        image_icon: form.image_icon || null,
        order: parseInt(form.order) || 0,
        is_active: form.is_active
      };
      
      if (editId) {
        await updateEmissionCategory(editId, categoryData);
        setSuccess('Catégorie modifiée avec succès.');
      } else {
        await createEmissionCategory(categoryData);
        setSuccess('Catégorie créée avec succès.');
      }
      handleCloseDrawer();
      loadCategories();
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
    try {
      await deleteEmissionCategory(id);
      setSuccess('Catégorie supprimée.');
      loadCategories();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(category) {
    setForm({
      name: category.name || '',
      image_main: category.image_main || '',
      image_background: category.image_background || '',
      image_icon: category.image_icon || '',
      order: category.order || 0,
      is_active: category.is_active !== false
    });
    setEditId(category.id || category._id);
    setIsDrawerOpen(true);
    setError('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      name: '',
      image_main: '',
      image_background: '',
      image_icon: '',
      order: 0,
      is_active: true
    });
    setError('');
  }

  const columns = [
    { 
      key: 'order', 
      label: 'Ordre',
      render: (val) => (
        <span className="font-medium text-gray-900">{val || 0}</span>
      )
    },
    { 
      key: 'name', 
      label: 'Nom',
      render: (val) => (
        <span className="font-medium text-gray-900">{val || '-'}</span>
      )
    },
    { 
      key: 'image_main', 
      label: 'Image Principale',
      render: (val) => val ? (
        <img src={val} alt="Main" className="w-20 h-12 object-cover rounded" />
      ) : (
        <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">-</span>
        </div>
      )
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
      )
    },
  ];

  const actions = [
    { 
      label: 'Modifier', 
      onClick: handleEdit, 
      className: 'text-blue-600 hover:text-blue-800',
      icon: 'edit'
    },
    { 
      label: 'Supprimer', 
      onClick: handleDelete, 
      className: 'text-red-600 hover:text-red-800',
      icon: 'delete'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Catégories d'Émissions"
          description="Gérer les catégories affichées dans l'écran Émissions de l'application mobile"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Catégorie
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? ' Modifier la Catégorie' : ' Nouvelle Catégorie'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong> Info :</strong> Ces catégories seront affichées comme grandes cartes dans l'écran Émissions de l'application mobile.
              </p>
            </div>

            <FormInput
              label="Nom de la Catégorie"
              placeholder="Sports, JT & Mag, Divertissement, Reportages..."
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />

            {/* Image Principale */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="text-sm font-semibold text-blue-900 mb-3"> Image Principale (Obligatoire)</h4>
              <ImageUpload
                label="Image de la carte catégorie"
                value={form.image_main}
                onChange={(url) => setForm({...form, image_main: url})}
                disabled={submitting}
                helperText="Cette image sera affichée sur la grande carte de la catégorie (recommandé: 800x600px)"
                required
              />
            </div>

            {/* Image de Fond */}
            <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
              <h4 className="text-sm font-semibold text-purple-900 mb-3"> Image de Fond (Optionnel)</h4>
              <ImageUpload
                label="Image d'arrière-plan"
                value={form.image_background}
                onChange={(url) => setForm({...form, image_background: url})}
                disabled={submitting}
                helperText="Image de fond pour créer un effet visuel derrière la carte (recommandé: 1920x1080px)"
              />
            </div>

            {/* Icône */}
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <h4 className="text-sm font-semibold text-green-900 mb-3"> Icône (Optionnel)</h4>
              <ImageUpload
                label="Petite icône de la catégorie"
                value={form.image_icon}
                onChange={(url) => setForm({...form, image_icon: url})}
                disabled={submitting}
                helperText="Petite icône qui représente la catégorie (recommandé: 200x200px, format carré)"
              />
            </div>

            <FormInput
              label="Ordre d'Affichage"
              type="number"
              placeholder="0"
              value={form.order}
              onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
              min="0"
              helperText="Plus petit = affiché en premier"
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
                 Catégorie Active (visible dans l'application)
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
                  editId ? ' Mettre à jour' : ' Créer'
                )}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleCloseDrawer}
                disabled={submitting}
              >
                 Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des catégories..." />
        ) : categories.length === 0 ? (
          <EmptyState 
            icon=""
            title="Aucune catégorie"
            message="Créez votre première catégorie d'émissions pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={categories}
              actions={actions}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
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
