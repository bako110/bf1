import React, { useState, useEffect } from 'react';
import { sportService } from '../services/sportService';
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

export default function Sports() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // États pour l'upload
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    video_url: '',
    video_file: null,
    video_source: 'url',
    is_active: true,
    is_new: false,
    category: 'sport',
    sport_type: '',
    teams: []
  });

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setLoading(true);
      console.log('📋 Chargement des sports...');
      const data = await sportService.getAllSports();
      console.log('✅ Sports récupérés:', data);
      console.log('📊 Nombre de sports:', data.length);
      
      if (data.length === 0) {
        console.log('📭 Aucun sport trouvé');
        setSuccess('');
        setError('');
      } else {
        console.log('📋 Premier sport:', data[0]);
        setSuccess('');
        setError('');
      }
      
      setSports(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sports:', error);
      
      // Gérer les messages d'erreur spécifiques
      let errorMessage = 'Erreur lors du chargement des sports.';
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('Aucun sport')) {
          errorMessage = 'Aucun sport disponible dans la base de données.';
          setSports([]); // Vider la liste
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSuccess('');
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Vérifier que l'upload est terminé
    if (uploadingVideo) {
      setError('Veuillez attendre la fin de l\'upload de la vidéo');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Préparer les données selon le schéma backend
      const sportData = {
        title: form.title,
        description: form.description || null,
        category: 'sport',
        subcategory: null,
        sport_type: form.sport_type || null,
        teams: form.teams || [],
        image: form.image || null,
        thumbnail: null,
        video_url: form.video_url || null,
        duration: null,
        date: new Date().toISOString(),
        presenter: null,
        tags: [],
        featured: false,
        is_new: form.is_new || false,
        is_active: form.is_active !== false
      };
      
      console.log('📤 Données envoyées au backend:', sportData);
      
      if (editId) {
        await sportService.updateSport(editId, sportData);
        setSuccess('Sport modifié avec succès.');
      } else {
        await sportService.createSport(sportData);
        setSuccess('Sport créé avec succès.');
      }
      
      handleClose();
      loadSports();
    } catch (e) {
      console.error('Erreur détaillée:', e.response?.data);
      const errorMessage = e.response?.data?.detail || 
                          e.response?.data?.message || 
                          e.message || 
                          'Erreur lors de la sauvegarde';
      setError('Erreur: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      title: '', 
      description: '',
      image: '',
      video_url: '', 
      video_file: null, 
      video_source: 'url',
      is_active: true,
      is_new: false,
      category: 'sport',
      sport_type: '',
      teams: []
    });
    setError('');
    setSuccess('');
    setUploadingVideo(false);
    setUploadVideoProgress(0);
    setUploadingImage(false);
    setUploadImageProgress(0);
  }

  function handleDelete(item) {
    console.log('🗑️ Élément à supprimer:', item);
    console.log('🆔 id de l\'élément:', item.id);
    console.log('🆔 _id de l\'élément:', item._id);
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id; // Utiliser id ou _id
    console.log('🗑️ Tentative de suppression - ID:', id);
    console.log('🗑️ Élément complet:', itemToDelete);
    
    if (!id) {
      console.error('❌ ID undefined, élément:', itemToDelete);
      setError('Erreur: ID du sport non trouvé');
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      console.log('🗑️ Suppression du sport:', id);
      await sportService.deleteSport(id);
      setSuccess('Sport supprimé avec succès.');
      loadSports();
    } catch (e) {
      console.error('Erreur lors de la suppression:', e.response?.data);
      let errorMessage = 'Erreur lors de la suppression.';
      
      // Gérer les messages d'erreur spécifiques
      if (e.response?.data?.detail) {
        if (e.response.data.detail.includes('Aucun sport disponible')) {
          errorMessage = 'Aucun sport n\'est disponible dans la base de données.';
        } else if (e.response.data.detail.includes('non trouvé')) {
          errorMessage = `Sport non trouvé: ${e.response.data.detail}`;
        } else {
          errorMessage = e.response.data.detail;
        }
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setError('Erreur: ' + errorMessage);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(item) {
    console.log('✏️ Édition du sport:', item);
    setForm({ 
      title: item.title || '', 
      description: item.description || '',
      image: item.image || '',
      video_url: item.video_url || '',
      video_file: null,
      video_source: item.video_url ? 'url' : 'file',
      is_active: item.is_active !== false,
      is_new: item.is_new || false,
      category: item.category || 'sport',
      sport_type: item.sport_type || '',
      teams: item.teams || []
    });
    const id = item.id || item._id; // Utiliser id ou _id
    console.log('📝 ID du sport à éditer:', id);
    setEditId(id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Définitions des colonnes et actions pour DataTable
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
    { 
      key: 'sport_type', 
      label: 'Type de sport',
      render: (val) => (
        <span className="text-sm text-gray-600">
          {val || '-'}
        </span>
      )
    },
    { 
      key: 'is_active', 
      label: 'Statut',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === false 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {value === false ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Inactif
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Actif
            </>
          )}
        </span>
      )
    },
    { 
      key: 'views', 
      label: 'Vues',
      render: (value) => (
        <span className="text-xs text-gray-500">
          {value || 0}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Créé le',
      render: (value) => (
        <span className="text-xs text-gray-500">
          {formatDate(value)}
        </span>
      )
    },
  ];

  const actions = [
    {
      label: 'Modifier',
      icon: 'edit',
      onClick: (item) => handleEdit(item),
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      onClick: (item) => handleDelete(item),
      className: 'text-red-600 hover:text-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Sports"
          description="Créer et gérer les contenus sportifs"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Sport
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier le Sport' : 'Nouveau Sport'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput 
              label="Titre" 
              placeholder="Titre du contenu sportif" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
            />

            <FormTextarea 
              label="Description" 
              placeholder="Description du contenu sportif..." 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              rows={4} 
            />

            {/* Champs spécifiques au sport */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Type de sport" 
                placeholder="Ex: Football, Basket, Tennis..." 
                value={form.sport_type} 
                onChange={e => setForm({...form, sport_type: e.target.value})} 
              />
            </div>

            {/* Upload Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image du Sport</label>
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
                  <p className="text-sm text-green-800">Image uploadée</p>
                </div>
              )}
            </div>

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
                  <span className="ml-2 text-sm font-medium text-gray-700">Fichier</span>
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
                  <span className="ml-2 text-sm font-medium text-gray-700">URL</span>
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
                      <p className="text-sm text-green-800">Video uploadée</p>
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

            {/* Options supplémentaires */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Actif
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={e => setForm({...form, is_new: e.target.checked})}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Nouveau
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editId ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  editId ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose} disabled={submitting}>
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des sports..." />
        ) : sports.length === 0 ? (
          <EmptyState 
            title="Aucun sport" 
            message="Aucun contenu sportif n'est disponible. Créez votre premier sport pour commencer." 
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={sports} actions={actions} />
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Supprimer le sport"
        message="Êtes-vous sûr de vouloir supprimer ce sport ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}