import React, { useEffect, useState } from 'react';
import { fetchReplays, createReplay, updateReplay, deleteReplay } from '../services/replayService';
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
import ConfirmModal from './ui/ConfirmModal';
import Pagination from './ui/Pagination';

export default function Replays() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    thumbnail: '', 
    video_url: '', 
    duration_minutes: 0, 
    views: 0, 
    rating: 0, 
    aired_at: '', 
    program_title: '', 
    host: '' 
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
    loadReplays();
  }, []);

  async function loadReplays(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchReplays(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des replays.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadReplays(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadReplays(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateReplay(editId, form);
        setSuccess('Replay modifié avec succès.');
      } else {
        await createReplay(form);
        setSuccess('Replay créé avec succès.');
      }
      handleCloseDrawer();
      loadReplays();
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
      await deleteReplay(id);
      setSuccess('Replay supprimé.');
      loadReplays();
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
      description: item.description || '',
      category: item.category || '',
      thumbnail: item.thumbnail || '',
      video_url: item.video_url || '',
      duration_minutes: item.duration_minutes || 0,
      views: item.views || 0,
      rating: item.rating || 0,
      aired_at: item.aired_at ? new Date(item.aired_at).toISOString().split('T')[0] : '',
      program_title: item.program_title || '',
      host: item.host || ''
    });
    setEditId(item.id || item._id);
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
      category: '', 
      thumbnail: '', 
      video_url: '', 
      duration_minutes: 0, 
      views: 0, 
      rating: 0, 
      aired_at: '', 
      program_title: '', 
      host: '' 
    });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre', render: (val) => String(val || '') },
    { key: 'category', label: 'Catégorie', render: (val) => String(val || '') },
    { key: 'program_title', label: 'Programme', render: (val) => String(val || '') },
    { 
      key: 'duration_minutes', 
      label: 'Durée',
      render: (val) => `${val || 0} min`
    },
    { 
      key: 'aired_at', 
      label: 'Diffusé le',
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
          title="Gestion des Replays"
          description="Créer et gérer les rediffusions d'émissions"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Replay
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
                  Charger plus de replays ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? '✏️ Modifier le Replay' : '➕ Nouveau Replay'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Remplissez tous les champs pour créer un replay complet.
              </p>
            </div>

            <FormInput
              label="Titre du Replay"
              placeholder="Journal du 20H - 05/02/2026"
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
              label="Titre du Programme"
              placeholder="Le 20H"
              value={form.program_title}
              onChange={e => setForm({...form, program_title: e.target.value})}
            />

            <FormInput
              label="Présentateur/Animateur"
              placeholder="Fatou Sow"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
            />

            <FormInput
              label="URL de la Vidéo"
              placeholder="https://exemple.com/video.mp4"
              type="url"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
              required
            />

            <ImageUpload
              label="Miniature du Replay"
              value={form.thumbnail}
              onChange={(url) => setForm({...form, thumbnail: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour la miniature"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Durée (minutes)"
                type="number"
                placeholder="45"
                value={form.duration_minutes}
                onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value) || 0})}
                required
                min="1"
                max="600"
              />

              <FormInput
                label="Date de Diffusion"
                type="date"
                value={form.aired_at}
                onChange={e => setForm({...form, aired_at: e.target.value})}
                required
              />
            </div>

            <FormTextarea
              label="Description"
              placeholder="Description détaillée du replay..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              required
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
                onClick={handleCloseDrawer}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des replays..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="🎬"
            title="Aucun replay"
            message="Créez votre premier replay pour le voir apparaître ici."
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
        title="Supprimer le Replay"
        message={`Êtes-vous sûr de vouloir supprimer le replay "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
