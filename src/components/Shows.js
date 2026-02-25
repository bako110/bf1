import React, { useEffect, useState } from 'react';
import { fetchShows, createShow, updateShow, deleteShow } from '../services/showService';
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
import ImageUpload from './ui/ImageUpload';
import Pagination from './ui/Pagination';

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    host: '', 
    category: '', 
    image_url: '',
    live_url: '',
    replay_url: '',
    duration: '',
    is_live: false,
    views_count: 0
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchShows(page, itemsPerPage);
      if (append) {
        setShows(prev => [...prev, ...data.items]);
      } else {
        setShows(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des émissions.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadShows(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadShows(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createShow(form);
        setSuccess('Émission créée avec succès.');
      }
      setForm({ 
        title: '', 
        description: '', 
        host: '', 
        category: '', 
        image_url: '',
        live_url: '',
        replay_url: '',
        duration: '',
        is_live: false,
        views_count: 0
      });
      setEditId(null);
      setIsDrawerOpen(false);
      loadShows();
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
      await deleteShow(id);
      setSuccess('Émission supprimée.');
      loadShows();
    } catch (e) {
        setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(show) {
    setForm({ 
      title: show.title, 
      description: show.description || '', 
      host: show.host || '',
      category: show.category || '',
      image_url: show.image_url || '',
      live_url: show.live_url || '',
      replay_url: show.replay_url || '',
      duration: show.duration || '',
      is_live: show.is_live || false,
      views_count: show.views_count || 0
    });
    setEditId(show.id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      title: '', 
      description: '', 
      host: '', 
      category: '', 
      image_url: '',
      live_url: '',
      replay_url: '',
      duration: '',
      is_live: false,
      views_count: 0
    });
    setError('');
  }

  const columns = [
    { 
      key: 'title', 
      label: 'Titre', 
      render: (val) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 line-clamp-2" 
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               lineHeight: '1.4'
             }}>
            {val || '-'}
          </p>
        </div>
      )
    },
    { key: 'host', label: 'Animateur', render: (val) => String(val || '') },
    { key: 'category', label: 'Catégorie', render: (val) => String(val || '') },
    { 
      key: 'is_live', 
      label: 'Statut',
      render: (val) => val ? 'En direct' : 'Replay'
    }
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
          title="Gestion des Émissions"
          description="Créer et gérer le catalogue d'émissions"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Émission
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {shows.length > 0 && currentPage < totalPages && (
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
                  Charger plus d'émissions ({shows.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier l\'Émission' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Titre de l'émission"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="Animateur"
              placeholder="Nom de l'animateur"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
            />
            <FormInput
              label="Catégorie"
              placeholder="Catégorie"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            />
            <ImageUpload
              label="Image de l'Émission"
              value={form.image_url}
              onChange={(url) => setForm({...form, image_url: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'émission"
            />
            <FormInput
              label="URL du live"
              placeholder="https://example.com/live/emission"
              value={form.live_url}
              onChange={e => setForm({...form, live_url: e.target.value})}
              type="url"
            />
            <FormInput
              label="URL du replay"
              placeholder="https://example.com/replay/emission"
              value={form.replay_url}
              onChange={e => setForm({...form, replay_url: e.target.value})}
              type="url"
            />
            <FormInput
              label="Durée (format HH:MM:SS)"
              placeholder="01:30:00"
              value={form.duration}
              onChange={e => setForm({...form, duration: e.target.value})}
            />
            <FormInput
              label="Nombre de vues"
              placeholder="0"
              type="number"
              value={form.views_count}
              onChange={e => setForm({...form, views_count: parseInt(e.target.value) || 0})}
            />
            <FormTextarea
              label="Description"
              placeholder="Description de l'émission..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_live"
                checked={form.is_live} 
                onChange={e => setForm({...form, is_live: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_live" className="text-sm font-medium text-gray-700">En direct</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
              >
                {editId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleCloseDrawer}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des émissions..." />
        ) : shows.length === 0 ? (
          <EmptyState 
            icon="📺"
            title="Aucune émission"
            message="Créez votre première émission pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={shows}
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
        title="Supprimer l'Émission"
        message={`Êtes-vous sûr de vouloir supprimer l'émission "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}

