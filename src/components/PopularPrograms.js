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
import ConfirmModal from './ui/ConfirmModal';

export default function PopularPrograms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '', image_file: null, video_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  
  // États pour l'upload d'image
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);
  const [uploadImageError, setUploadImageError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  // Upload automatique d'image via backend
  async function handleImageSelect(file) {
    if (!file) return;
    
    setForm({...form, image_file: file});
    setUploadImageError('');
    setUploadingImage(true);
    setUploadImageProgress(0);
    
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadImageProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.data?.url || response.data?.secure_url || response.url;
          setForm(prev => ({...prev, image: imageUrl}));
          setUploadImageProgress(100);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Erreur upload');
        }
        setUploadingImage(false);
      });
      
      xhr.addEventListener('error', () => {
        setUploadImageError('Erreur lors de l\'upload');
        setForm(prev => ({...prev, image_file: null}));
        setUploadingImage(false);
      });
      
      xhr.open('POST', 'http://localhost:8000/api/v1/upload/image');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
      
    } catch (err) {
      setUploadImageError('Erreur lors de l\'upload: ' + err.message);
      setForm(prev => ({...prev, image_file: null}));
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (uploadingImage) {
      setError('Veuillez attendre la fin de l\'upload de l\'image');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const programData = {
        title: form.title,
        description: form.description,
        category: form.category,
        schedule: form.schedule,
        episodes: parseInt(form.episodes) || 0,
        image: form.image || null,
        video_url: form.video_url || null
      };
      
      console.log('📤 Données envoyées au backend:', programData);
      
      if (editId) {
        await updatePopularProgram(editId, programData);
        setSuccess('Programme modifié avec succès.');
      } else {
        await createPopularProgram(programData);
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
    setForm({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '', image_file: null, video_url: '' });
    setError('');
    setUploadingImage(false);
    setUploadImageProgress(0);
    setUploadImageError('');
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const itemId = itemToDelete?.id || itemToDelete?._id;
    if (!itemId) {
      setError('Erreur: ID du programme introuvable.');
      setDeleteModalOpen(false);
      setItemToDelete(null);
      return;
    }
    try {
      await deletePopularProgram(itemId);
      setSuccess('Programme supprimé.');
      loadPrograms();
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
      schedule: item.schedule || '',
      episodes: item.episodes || 0,
      image: item.image || '',
      image_file: null,
      video_url: item.video_url || ''
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image du Programme <span className="text-red-500">*</span>
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
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => handleImageSelect(e.target.files[0])}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {uploadingImage && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-800 font-medium">
                      Upload vers Cloudinary en cours...
                    </p>
                    <span className="text-sm text-blue-600">{uploadImageProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadImageProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {form.image && !uploadingImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    Image uploadée avec succès
                  </p>
                  {form.image_file && (
                    <p className="text-xs text-green-600 mt-1">
                      Fichier: {form.image_file.name}
                    </p>
                  )}
                </div>
              )}
              {uploadImageError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">{uploadImageError}</p>
                </div>
              )}
            </div>

            <FormInput
              label="URL de la Vidéo (Optionnel)"
              placeholder="https://www.youtube.com/watch?v=... ou URL directe"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
              helperText="Ajoutez une vidéo YouTube ou une URL de vidéo directe"
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

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer le Programme"
        message={`Êtes-vous sûr de vouloir supprimer le programme "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
