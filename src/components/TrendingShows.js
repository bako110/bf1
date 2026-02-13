import React, { useEffect, useState } from 'react';
import { fetchTrendingShows, createTrendingShow, updateTrendingShow, deleteTrendingShow } from '../services/trendingShowService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import FormSelect from './ui/FormSelect';
import EmptyState from './ui/EmptyState';
import ImageUpload from './ui/ImageUpload';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';
import { fetchCategories } from '../services/categoryService';

export default function TrendingShows() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [form, setForm] = useState({ title: '', category: '', image: '', video_url: '', video_file: null, video_source: 'url', description: '', host: '' });
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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadTrendingShows();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (e) {
      console.error('Erreur chargement catégories:', e);
    }
  }

  async function loadTrendingShows(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchTrendingShows(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des émissions tendances.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadTrendingShows(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadTrendingShows(currentPage + 1, true);
    }
  };

  async function handleVideoSelect(file) {
    if (!file) return;
    
    setUploadingVideo(true);
    setUploadVideoProgress(0);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadVideoProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.data?.url || response.data?.secure_url;
          setForm(prev => ({...prev, video_url: videoUrl, video_file: file}));
          setUploadVideoProgress(100);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Erreur upload');
        }
        setUploadingVideo(false);
      });
      
      xhr.addEventListener('error', () => {
        setError('Erreur lors de l\'upload de la vidéo');
        setForm(prev => ({...prev, video_file: null}));
        setUploadingVideo(false);
      });
      
      xhr.open('POST', 'http://localhost:8000/api/v1/upload/video');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
      
    } catch (err) {
      setError('Erreur lors de l\'upload: ' + err.message);
      setForm(prev => ({...prev, video_file: null}));
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (uploadingVideo) {
      setError('Veuillez attendre la fin de l\'upload de la vidéo');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editId) {
        await updateTrendingShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createTrendingShow(form);
        setSuccess('Émission créée avec succès.');
      }
      handleClose();
      loadTrendingShows();
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
    const itemId = itemToDelete.id || itemToDelete._id;
    try {
      await deleteTrendingShow(itemId);
      setSuccess('Émission supprimée.');
      loadTrendingShows();
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
      image: item.image || '',
      video_url: item.video_url || '',
      video_file: null,
      video_source: item.video_url ? 'url' : 'file',
      description: item.description || '',
      host: item.host || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', category: '', image: '', video_url: '', video_file: null, video_source: 'url', description: '', host: '' });
    setError('');
    setUploadingVideo(false);
    setUploadVideoProgress(0);
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'host', label: 'Animateur' },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Émissions Tendances"
          description="Gérer les émissions populaires du moment"
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
                  Charger plus d'émissions ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier l\'Émission' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Astuce :</strong> Ajoutez les émissions les plus populaires du moment.
              </p>
            </div>

            <FormInput
              label="Titre de l'Émission"
              placeholder="Le Grand Show"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormSelect
              label="Catégorie"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
              required
              helperText="Sélectionnez une catégorie existante ou créez-en une dans la section Catégories"
            />

            <FormInput
              label="Animateur/Présentateur"
              placeholder="Nom de l'animateur"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
              required
            />

            <ImageUpload
              label="Image de l'Émission"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'émission"
            />

            {/* Choix source vidéo */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Source de la Vidéo (Optionnel)
              </label>
              <div className="flex gap-4">
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
              </div>

              {form.video_source === 'file' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour sélectionner une vidéo</span>
                        </p>
                        <p className="text-xs text-gray-500">MP4, WebM, MOV (MAX. 100MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="video/*"
                        onChange={e => handleVideoSelect(e.target.files[0])}
                        disabled={uploadingVideo}
                      />
                    </label>
                  </div>
                  {uploadingVideo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-800 font-medium">
                          Upload vers Cloudinary en cours...
                        </p>
                        <span className="text-sm text-blue-600">{uploadVideoProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadVideoProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {form.video_url && !uploadingVideo && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">✓ Vidéo uploadée</p>
                      {form.video_file && (
                        <p className="text-xs text-green-600 mt-1">
                          Fichier: {form.video_file.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <FormInput
                  label="URL de la Vidéo"
                  placeholder="https://www.youtube.com/watch?v=... ou URL directe"
                  type="url"
                  value={form.video_url}
                  onChange={e => setForm({...form, video_url: e.target.value})}
                  helperText="YouTube, Vimeo, ou lien direct vers une vidéo"
                />
              )}
            </div>

            <FormTextarea
              label="Description"
              placeholder="Description de l'émission..."
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
                  editId ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                fullWidth 
                onClick={handleClose}
                disabled={submitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des émissions tendances..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="📺"
            title="Aucune émission tendance"
            message="Créez votre première émission tendance pour la voir apparaître ici."
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
        title="Supprimer l'Émission"
        message={`Êtes-vous sûr de vouloir supprimer l'émission "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
