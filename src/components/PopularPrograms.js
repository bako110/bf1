import React, { useEffect, useState } from 'react';
import { fetchPopularPrograms, createPopularProgram, updatePopularProgram, deletePopularProgram } from '../services/popularProgramsService';
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

export default function PopularPrograms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchPopularPrograms(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadPrograms(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadPrograms(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updatePopularProgram(editId, form);
        setSuccess('Programme modifié avec succès.');
      } else {
        await createPopularProgram(form);
        setSuccess('Programme créé avec succès.');
      }
      handleClose();
      loadPrograms();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '' });
    setError('');
  }

  async function handleDelete(item) {
    const itemId = item?.id || item?._id;
    if (!itemId) {
      setError('Erreur: ID du programme introuvable.');
      return;
    }
    if (window.confirm('Supprimer ce programme ?')) {
      try {
        await deletePopularProgram(itemId);
        setSuccess('Programme supprimé.');
        loadPrograms();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      description: item.description || '',
      category: item.category || '',
      schedule: item.schedule || '',
      episodes: item.episodes || 0,
      image: item.image || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'schedule', label: 'Horaire' },
    { 
      key: 'episodes', 
      label: 'Épisodes',
      render: (val) => val || 0
    },
    { 
      key: 'rating', 
      label: 'Note',
      render: (val) => val ? `⭐ ${val.toFixed(1)}` : '-'
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
          title="Gestion des Programmes Populaires"
          description="Créer et gérer les programmes les plus populaires"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
              disabled={submitting}
            >
              + Nouveau Programme
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
                  Charger plus de programmes ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier le Programme' : '➕ Nouveau Programme'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <p className="text-sm text-purple-800">
                <strong>💡 Astuce :</strong> Les programmes populaires apparaissent en vedette dans l'application.
              </p>
            </div>

            <FormInput
              label="Titre du Programme"
              placeholder="Le 20H"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormInput
              label="Catégorie"
              placeholder="Actualités, Sport, Culture..."
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              required
            />

            <FormInput
              label="Horaire"
              placeholder="20:00"
              value={form.schedule}
              onChange={e => setForm({...form, schedule: e.target.value})}
              required
              helperText="Format: HH:MM"
            />

            <FormInput
              label="Nombre d'Épisodes"
              type="number"
              placeholder="0"
              value={form.episodes}
              onChange={e => setForm({...form, episodes: parseInt(e.target.value) || 0})}
              required
              min="0"
            />

            <FormTextarea
              label="Description"
              placeholder="Description détaillée du programme..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              required
            />

            <ImageUpload
              label="Image du Programme"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour le programme"
            />

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-800">
                <strong>ℹ️ Note :</strong> La note est générée automatiquement par les utilisateurs.
              </p>
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
          <Loader size="lg" text="Chargement des programmes populaires..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="⭐"
            title="Aucun programme populaire"
            message="Créez votre premier programme populaire pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
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
    </div>
  );
}
