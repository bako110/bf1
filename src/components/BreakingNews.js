import React, { useEffect, useState } from 'react';
import { fetchBreakingNews, createBreakingNews, updateBreakingNews, deleteBreakingNews } from '../services/breakingNewsService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import ImageUpload from './ui/ImageUpload';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';

export default function BreakingNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', category: '', description: '', image: '', author: '' });
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
    loadBreakingNews();
  }, []);

  async function loadBreakingNews(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchBreakingNews(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des actualités urgentes.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadBreakingNews(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadBreakingNews(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateBreakingNews(editId, form);
        setSuccess('Actualité urgente modifiée avec succès.');
      } else {
        await createBreakingNews(form);
        setSuccess('Actualité urgente créée avec succès.');
      }
      handleClose();
      loadBreakingNews();
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
      await deleteBreakingNews(id);
      setSuccess('Actualité urgente supprimée.');
      loadBreakingNews();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(item) {
    setForm({
      title: item.title || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      author: item.author || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', category: '', description: '', image: '', author: '' });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'author', label: 'Auteur' },
    { 
      key: 'created_at', 
      label: 'Date',
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
          title="Gestion des Actualités Urgentes"
          description="Créer et gérer les actualités urgentes"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
              disabled={submitting}
            >
              + Nouvelle Actualité Urgente
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {items.length > 0 && currentPage < totalPages && (
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
                  Charger plus d'actualités ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier l\'Actualité Urgente' : 'Nouvelle Actualité Urgente'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Titre de l'actualité"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="Catégorie"
              placeholder="Ex: Politique, Économie, Sports"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              required
            />
            <FormInput
              label="Auteur"
              placeholder="Nom de l'auteur"
              value={form.author}
              onChange={e => setForm({...form, author: e.target.value})}
              required
            />
            <FormTextarea
              label="Description"
              placeholder="Contenu de l'actualité..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
              required
            />
            <ImageUpload
              label="Image de l'Actualité"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              helperText="Sélectionnez une image pour l'actualité"
            />
            <div className="flex gap-3 pt-2">
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
          <Loader size="lg" text="Chargement des actualités urgentes..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="📰"
            title="Aucune actualité urgente"
            message="Créez votre première actualité urgente pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={items}
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
        title="Supprimer l'Actualité Urgente"
        message={`Êtes-vous sûr de vouloir supprimer l'actualité "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
