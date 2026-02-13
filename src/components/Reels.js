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
import ConfirmModal from './ui/ConfirmModal';

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
  
  // États pour l'upload
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  // Upload automatique vidéo
  async function handleVideoSelect(file) {
    if (!file) return;
    setForm({...form, video_file: file});
    setUploadingVideo(true);
    setUploadVideoProgress(0);
    
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadVideoProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.data?.url || response.data?.secure_url;
          setForm(prev => ({...prev, video_url: videoUrl}));
        }
        setUploadingVideo(false);
      });
      
      xhr.addEventListener('error', () => {
        setError('Erreur upload vidéo');
        setUploadingVideo(false);
      });
      
      xhr.open('POST', 'http://localhost:8000/api/v1/upload/video');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      setError('Erreur: ' + err.message);
      setUploadingVideo(false);
    }
  }

  // Upload automatique image
  async function handleImageSelect(file) {
    if (!file) return;
    setUploadingImage(true);
    setUploadImageProgress(0);
    
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadImageProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.data?.url || response.data?.secure_url;
          setForm(prev => ({...prev, thumbnail_url: imageUrl}));
        }
        setUploadingImage(false);
      });
      
      xhr.addEventListener('error', () => {
        setError('Erreur upload image');
        setUploadingImage(false);
      });
      
      xhr.open('POST', 'http://localhost:8000/api/v1/upload/image');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      setError('Erreur: ' + err.message);
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (uploadingVideo || uploadingImage) {
      setError('Veuillez attendre la fin des uploads');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const reelData = {
        title: form.title,
        description: form.description,
        video_url: form.video_url || null
      };
      
      if (editId) {
        await updateReel(editId, reelData);
        setSuccess('Reel modifié avec succès.');
      } else {
        await createReel(reelData);
        setSuccess('Reel créé avec succès.');
      }
      handleClose();
      loadReels();
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
      await deleteReel(itemId);
      setSuccess('Reel supprimé avec succès.');
      loadReels();
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
      video_file: null,
      video_url: item.video_url || '',
      video_source: item.video_url ? 'url' : 'file'
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setUploadingVideo(false);
    setUploadVideoProgress(0);
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

              {/* Upload Vidéo ou URL */}
              {form.video_source === 'file' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fichier Vidéo <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={e => handleVideoSelect(e.target.files[0])}
                    disabled={uploadingVideo}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingVideo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-800 font-medium">Upload vidéo...</p>
                        <span className="text-sm text-blue-600">{uploadVideoProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadVideoProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {form.video_url && !uploadingVideo && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">Vidéo uploadée ✓</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL de la Vidéo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... ou https://example.com/video.mp4"
                    value={form.video_url}
                    onChange={e => setForm({...form, video_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    💡 Formats supportés : YouTube, liens directs MP4, flux HLS (.m3u8)
                  </p>
                  {form.video_url && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">URL vidéo définie ✓</p>
                    </div>
                  )}
                </div>
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

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer le Reel"
        message={`Êtes-vous sûr de vouloir supprimer le reel "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
