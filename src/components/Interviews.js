import React, { useEffect, useState } from 'react';
import { fetchInterviews, createInterview, updateInterview, deleteInterview } from '../services/interviewService';
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

export default function Interviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', guest_name: '', description: '', image: '', video_url: '', video_file: null, video_source: 'file' });
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

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchInterviews(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des interviews.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadInterviews(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadInterviews(currentPage + 1, true);
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
          setForm(prev => ({...prev, image: imageUrl}));
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
    
    try {
      const payload = {
        title: form.title,
        guest_name: form.guest_name,
        description: form.description,
        image: form.image || null,
        video_url: form.video_url || null
      };
      
      if (editId) {
        await updateInterview(editId, payload);
        setSuccess('Interview modifiée avec succès.');
      } else {
        await createInterview(payload);
        setSuccess('Interview créée avec succès.');
      }
      handleClose();
      loadInterviews();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', guest_name: '', description: '', image: '', video_url: '', video_file: null, video_source: 'file' });
    setError('');
    setUploadingVideo(false);
    setUploadVideoProgress(0);
    setUploadingImage(false);
    setUploadImageProgress(0);
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id;
    setError('');
    setSuccess('');
    try {
      await deleteInterview(id);
      setSuccess('Interview supprimée.');
      loadInterviews();
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
      guest_name: item.guest_name || '',
      description: item.description || '',
      image: item.image || '',
      video_url: item.video_url || '',
      video_file: null,
      video_source: item.video_url ? 'url' : 'file'
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'guest_name', label: 'Invité' }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Interviews"
          description="Créer et gérer les interviews"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Interview
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
                  Charger plus d'interviews ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier l\'Interview' : 'Nouvelle Interview'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Titre" placeholder="Titre de l'interview" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <FormInput label="Nom de l'invité" placeholder="Nom complet" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} required />
            <FormTextarea label="Description" placeholder="Description ou contenu..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} required />
            
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
                  <label className="block text-sm font-medium text-gray-700">Fichier Vidéo</label>
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
                      <p className="text-sm text-green-800">✓ Vidéo uploadée</p>
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
                />
              )}
            </div>

            {/* Upload Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image de l'Interview</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => handleImageSelect(e.target.files[0])}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {uploadingImage && (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-800 font-medium">Upload image...</p>
                    <span className="text-sm text-purple-600">{uploadImageProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${uploadImageProgress}%` }} />
                  </div>
                </div>
              )}
              {form.image && !uploadingImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">Image uploadée ✓</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth>{editId ? 'Mettre à jour' : 'Créer'}</Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose}>Annuler</Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des interviews..." />
        ) : items.length === 0 ? (
          <EmptyState icon="🎤" title="Aucune interview" message="Créez votre première interview." />
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
        title="Supprimer l'Interview"
        message={`Êtes-vous sûr de vouloir supprimer l'interview "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
