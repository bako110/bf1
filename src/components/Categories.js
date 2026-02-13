import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: ''
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
      const data = await fetchCategories();
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
    setSubmitting(true);
    
    try {
      const categoryData = {
        name: form.name,
        description: form.description
      };
      
      if (editId) {
        await updateCategory(editId, categoryData);
        setSuccess('Catégorie modifiée avec succès.');
      } else {
        await createCategory(categoryData);
        setSuccess('Catégorie créée avec succès.');
      }
      handleClose();
      loadCategories();
    } catch (e) {
      setError('Erreur: ' + (e.response?.data?.detail || e.message));
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
    const itemId = itemToDelete.id || itemToDelete._id;
    try {
      await deleteCategory(itemId);
      setSuccess('Catégorie supprimée avec succès.');
      loadCategories();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(item) {
    setForm({
      name: item.name || '',
      description: item.description || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      name: '', 
      description: ''
    });
    setError('');
  }

  const columns = [
    { key: 'name', label: 'Nom', render: (val) => String(val || '') },
    { key: 'description', label: 'Description', render: (val) => String(val || '-') },
    { 
      key: 'created_at', 
      label: 'Date de création',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
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
          title="Gestion des Catégories"
          description="Créer et gérer les catégories pour les contenus"
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

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier la Catégorie' : '➕ Nouvelle Catégorie'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Les catégories permettent d'organiser vos contenus (Replay, Interview, Archive, etc.).
              </p>
            </div>

            <FormInput
              label="Nom de la Catégorie"
              placeholder="Actualités, Sport, Culture..."
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />

            <FormTextarea
              label="Description (optionnel)"
              placeholder="Description de la catégorie..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
            />

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
          <Loader size="lg" text="Chargement des catégories..." />
        ) : items.length === 0 ? (
          <EmptyState icon="📁" title="Aucune catégorie" message="Créez votre première catégorie." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
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
        title="Supprimer la Catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${itemToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
