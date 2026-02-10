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
    video_file: null,
    video_url: '',
    video_source: 'file',
    duration_minutes: 0, 
    views: 0, 
    rating: 0, 
    aired_at: '', 
    program_title: ''
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
  
  // États pour l'upload Cloudinary
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

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

  // Upload automatique vers Cloudinary via backend
  async function handleFileSelect(file) {
    if (!file) return;
    
    setForm({...form, video_file: file});
    setUploadError('');
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Utiliser l'endpoint backend pour l'upload
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // Le backend retourne { success, message, data: { url, public_id, ... } }
          const videoUrl = response.data?.url || response.data?.secure_url || response.url;
          setForm(prev => ({...prev, video_url: videoUrl}));
          setUploadProgress(100);
          
          // Extraire la durée si disponible
          if (response.data?.duration) {
            const minutes = Math.ceil(response.data.duration / 60);
            setForm(prev => ({...prev, duration_minutes: minutes}));
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Erreur upload');
        }
        setUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        setUploadError('Erreur lors de l\'upload');
        setForm(prev => ({...prev, video_file: null}));
        setUploading(false);
      });
      
      xhr.open('POST', 'http://localhost:8000/api/v1/upload/video');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
      
    } catch (err) {
      setUploadError('Erreur lors de l\'upload: ' + err.message);
      setForm(prev => ({...prev, video_file: null}));
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Vérifier que l'upload est terminé
    if (uploading) {
      setError('Veuillez attendre la fin de l\'upload de la vidéo');
      return;
    }
    
    if (!form.video_url && !editId) {
      setError('Veuillez sélectionner une vidéo');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Préparer les données selon le schéma backend
      const replayData = {
        title: form.title,
        description: form.description,
        category: form.category,
        video_url: form.video_url || null,
        thumbnail: form.thumbnail || null,
        duration_minutes: parseInt(form.duration_minutes) || 1,
        aired_at: form.aired_at ? new Date(form.aired_at).toISOString() : new Date().toISOString(),
        program_title: form.program_title || null,
        host: null
      };
      
      console.log('📤 Données envoyées au backend:', replayData);
      
      if (editId) {
        await updateReplay(editId, replayData);
        setSuccess('Replay modifié avec succès.');
      } else {
        await createReplay(replayData);
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
      video_file: null,
      video_url: item.video_url || '',
      video_source: item.video_url ? 'url' : 'file',
      duration_minutes: item.duration_minutes || 0,
      views: item.views || 0,
      rating: item.rating || 0,
      aired_at: item.aired_at ? new Date(item.aired_at).toISOString().split('T')[0] : '',
      program_title: item.program_title || ''
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
      video_file: null,
      video_url: '',
      video_source: 'file',
      duration_minutes: 0, 
      views: 0, 
      rating: 0, 
      aired_at: '', 
      program_title: ''
    });
    setError('');
    setUploading(false);
    setUploadProgress(0);
    setUploadError('');
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

            {/* Sélecteur de source vidéo */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Source Vidéo</label>
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
                  <span className="ml-2 text-sm font-medium text-gray-700">📁 Fichier</span>
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
                  <span className="ml-2 text-sm font-medium text-gray-700">🔗 URL</span>
                </label>
              </div>

              {/* Option Fichier */}
              {form.video_source === 'file' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fichier Vidéo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour sélectionner</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">MP4, WebM, OGG (MAX. 100MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="video/*"
                        onChange={e => handleFileSelect(e.target.files[0])}
                        required={!editId}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-800 font-medium">Upload vidéo...</p>
                        <span className="text-sm text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {form.video_url && !uploading && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">✓ Vidéo uploadée</p>
                      {form.video_file && (
                        <p className="text-xs text-green-600 mt-1">Fichier: {form.video_file.name}</p>
                      )}
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">{uploadError}</p>
                    </div>
                  )}
                </div>
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
