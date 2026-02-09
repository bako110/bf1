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
import FileUpload from './ui/FileUpload';
import Pagination from './ui/Pagination';

export default function Reels() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '',
    video_file: null,
    video_url: '',
    video_source: 'file' // 'file' ou 'url'
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
      // Validation des données
      if (!form.title.trim()) {
        setError('Le titre est requis');
        setSubmitting(false);
        return;
      }
      
      if (!form.description.trim()) {
        setError('La description est requise');
        setSubmitting(false);
        return;
      }
      
      if (form.video_source === 'file' && !form.video_file) {
        setError('Veuillez sélectionner un fichier vidéo');
        setSubmitting(false);
        return;
      }
      
      if (form.video_source === 'url' && !form.video_url.trim()) {
        setError('Veuillez entrer une URL vidéo valide');
        setSubmitting(false);
        return;
      }
      
      let data;
      
      if (form.video_source === 'file') {
        // Option fichier : utiliser FormData
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        
        if (form.video_file) {
          formData.append('video_file', form.video_file);
        }
        
        data = formData;
      } else {
        // Option URL : utiliser JSON
        data = {
          title: form.title,
          description: form.description,
          video_url: form.video_url
        };
      }
      
      // Debug: afficher ce qui est envoyé
      console.log('Envoi des données:', data);
      console.log('Type de données:', data instanceof FormData ? 'FormData' : 'JSON');
      
      if (editId) {
        await updateReel(editId, data);
        setSuccess('Reel modifié avec succès.');
      } else {
        await createReel(data);
        setSuccess('Reel créé avec succès.');
      }
      handleClose();
      loadReels();
    } catch (e) {
      console.error('Erreur détaillée:', e);
      console.error('Response data:', e.response?.data);
      console.error('Response status:', e.response?.status);
      
      // Logging spécifique pour les erreurs 422
      if (e.response?.status === 422) {
        console.error('Detail content:', e.response?.data?.detail);
        console.error('Detail type:', typeof e.response?.data?.detail);
        console.error('Is array?', Array.isArray(e.response?.data?.detail));
      }
      
      let errorMessage = e.response?.data?.message || 
                   e.message || 
                   'Erreur lors de la sauvegarde';
      
      // Gérer les erreurs de validation 422 avec détails
      if (e.response?.status === 422 && e.response?.data?.detail) {
        const details = e.response.data.detail;
        if (Array.isArray(details)) {
          // Si c'est un tableau d'erreurs de validation
          errorMessage = details.map(err => 
            typeof err === 'object' ? err.msg || err.message : String(err)
          ).join(', ');
        } else if (typeof details === 'string') {
          errorMessage = details;
        }
      }
      
      setError('Erreur: ' + errorMessage);
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
      title: item.title || '',
      description: item.description || '',
      video_file: null,
      video_url: item.video_url || '',
      video_source: item.video_url ? 'url' : 'file'
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      title: '', 
      description: '',
      video_file: null,
      video_url: '',
      video_source: 'file'
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

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Source de la Vidéo <span className="text-red-500">*</span>
              </label>
              
              {/* Sélection de la source */}
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="video_source"
                    value="file"
                    checked={form.video_source === 'file'}
                    onChange={e => setForm({...form, video_source: 'file', video_url: ''})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">📁 Fichier local</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="video_source"
                    value="url"
                    checked={form.video_source === 'url'}
                    onChange={e => setForm({...form, video_source: 'url', video_file: null})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">🔗 Lien URL</span>
                </label>
              </div>

              {/* Option Fichier */}
              {form.video_source === 'file' && (
                <FileUpload
                  label="Fichier Vidéo"
                  accept="video/*"
                  maxSize={50 * 1024 * 1024} // 50MB
                  value={form.video_file}
                  onChange={(file) => setForm({...form, video_file: file})}
                  disabled={submitting}
                  helperText="Sélectionnez un fichier vidéo (MP4, WebM, OGG)"
                />
              )}

              {/* Option URL */}
              {form.video_source === 'url' && (
                <FormInput
                  label="URL de la Vidéo"
                  placeholder="https://exemple.com/video.mp4"
                  type="url"
                  value={form.video_url}
                  onChange={e => setForm({...form, video_url: e.target.value})}
                  required
                />
              )}
            </div>

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
