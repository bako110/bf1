import React, { useEffect, useState } from 'react';
import { fetchReels, createReel, updateReel, deleteReel } from '../services/reelService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';

export default function Reels() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    username: '', 
    description: ''
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  const columns = [
    { key: 'title', label: 'Titre', render: (val) => String(val || '') },
    { key: 'username', label: 'Créateur', render: (val) => String(val || '') },
    { 
      key: 'likes', 
      label: 'Likes',
      render: (val) => `❤️ ${val || 0}`
    },
    { 
      key: 'comments', 
      label: 'Commentaires',
      render: (val) => `💬 ${val || 0}`
    },
    { 
      key: 'shares', 
      label: 'Partages',
      render: (val) => `🔁 ${val || 0}`
    },
    { 
      key: 'created_at', 
      label: 'Date', 
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
    },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  useEffect(() => {
    loadReels();
  }, []);

  async function loadReels(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchReels(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des reels.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadReels(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadReels(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateReel(editId, form);
        setSuccess('Reel modifié avec succès.');
      } else {
        await createReel(form);
        setSuccess('Reel créé avec succès.');
      }
      handleClose();
      loadReels();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const itemId = item.id || item._id;
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await deleteReel(itemId);
        setSuccess('Reel supprimé avec succès.');
        loadReels();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({
      video_url: item.video_url || '',
      title: item.title || '',
      username: item.username || '',
      description: item.description || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      video_url: '', 
      title: '', 
      username: '', 
      description: ''
    });
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Reels"
          description="Créer et gérer les reels vidéo"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Reel
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
                  Charger plus de reels ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier le Reel' : '➕ Nouveau Reel'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-pink-50 border-l-4 border-pink-500 p-4 mb-6">
              <p className="text-sm text-pink-800">
                <strong>💡 Astuce :</strong> Créez des reels courts et engageants pour votre audience.
              </p>
            </div>

            <FormInput
              label="Titre du Reel"
              placeholder="Mon super reel"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormInput
              label="Nom du Créateur"
              placeholder="@username"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />

            <FormInput
              label="URL de la Vidéo"
              placeholder="https://exemple.com/video.mp4"
              type="url"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
              required
            />

            <FormTextarea
              label="Description"
              placeholder="Description du reel..."
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
                onClick={handleClose}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des reels..." />
        ) : items.length === 0 ? (
          <EmptyState icon="🎬" title="Aucun reel" message="Créez votre premier reel." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
            
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
