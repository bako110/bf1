import React, { useState, useEffect } from 'react';
import { sportService } from '../services/sportService';
import { uploadVideo } from '../services/uploadService'; // Correction: utilisation du bon service
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import ImageUpload from './ui/ImageUpload';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';
import DetailView from './ui/DetailView';

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
  
  // États pour l'upload vidéo
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);

  // États pour la vue détaillée
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
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
      console.log(' Chargement des sports...');
      const data = await sportService.getAllSports();
      console.log(' Sports récupérés:', data);
      console.log(' Nombre de sports:', data.length);
      
      if (data.length === 0) {
        console.log(' Aucun sport trouvé');
        setSuccess('');
        setError('');
      } else {
        console.log(' Premier sport:', data[0]);
        setSuccess('');
        setError('');
      }
      
      setSports(data);
    } catch (error) {
      console.error(' Erreur lors du chargement des sports:', error);
      
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

  // Upload automatique vidéo avec le service (version corrigée avec vraie progression)
  async function handleVideoSelect(file) {
    if (!file) return;
    setForm({...form, video_file: file});
    setUploadingVideo(true);
    setUploadVideoProgress(0);
    
    try {
      // Utilisation du service d'upload vidéo avec callback de progression
      const response = await uploadVideo(file, (progress) => {
        setUploadVideoProgress(progress);
      });
      
      // Récupération de l'URL depuis la réponse
      const videoUrl = response.data?.url || response.data?.secure_url || response.url;
      setForm(prev => ({...prev, video_url: videoUrl}));
      
    } catch (err) {
      setError('Erreur upload vidéo: ' + (err.response?.data?.detail || err.message));
      setForm(prev => ({...prev, video_file: null}));
    } finally {
      setUploadingVideo(false);
      setUploadVideoProgress(0);
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
      
      console.log(' Données envoyées au backend:', sportData);
      
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
  }

  function handleDelete(item) {
    console.log(' Élément à supprimer:', item);
    console.log(' id de l\'élément:', item.id);
    console.log(' _id de l\'élément:', item._id);
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id; // Utiliser id ou _id
    console.log(' Tentative de suppression - ID:', id);
    console.log(' Élément complet:', itemToDelete);
    
    if (!id) {
      console.error(' ID undefined, élément:', itemToDelete);
      setError('Erreur: ID du sport non trouvé');
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      console.log(' Suppression du sport:', id);
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
    console.log(' Édition du sport:', item);
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
    console.log(' ID du sport à éditer:', id);
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
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

  // Gestionnaire pour afficher les détails au clic sur une ligne
  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetailView(true);
  };

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
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong> Astuce :</strong> Ajoutez les actualités et contenus sportifs les plus récents.
              </p>
            </div>

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
            <ImageUpload
              label="Image du Sport"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour le sport (JPG, PNG, GIF, WebP - max 5MB)"
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
                  <span className="ml-2 text-sm font-medium text-gray-700"> Fichier</span>
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
                  <span className="ml-2 text-sm font-medium text-gray-700"> URL</span>
                </label>
              </div>

              {/* Option Fichier */}
              {form.video_source === 'file' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Fichier Vidéo</label>
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
                        <p className="text-sm text-blue-800 font-medium">Upload vidéo...</p>
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
                      <p className="text-sm text-green-800"> Vidéo uploadée avec succès</p>
                      {form.video_file && (
                        <p className="text-xs text-green-600 mt-1">Fichier: {form.video_file.name}</p>
                      )}
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
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={submitting || uploadingVideo}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editId ? 'Modification...' : 'Création...'}
                  </span>
                ) : (
                  editId ? ' Mettre à jour' : ' Créer'
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
          <Loader size="lg" text="Chargement des sports..." />
        ) : sports.length === 0 ? (
          <EmptyState 
            icon=""
            title="Aucun sport" 
            message="Aucun contenu sportif n'est disponible. Créez votre premier sport pour commencer." 
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns} 
              data={sports} 
              actions={actions} 
              onRowClick={handleRowClick} 
            />
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

      {/* Vue détaillée */}
      {showDetailView && selectedItem && (
        <Drawer
          isOpen={showDetailView}
          onClose={() => {
            setShowDetailView(false);
            setSelectedItem(null);
          }}
          title="Détails du sport"
        >
          <DetailView
            title={selectedItem.title}
            data={selectedItem}
            onClose={() => {
              setShowDetailView(false);
              setSelectedItem(null);
            }}
            onEdit={() => {
              setShowDetailView(false);
              handleEdit(selectedItem);
            }}
            onDelete={() => {
              setShowDetailView(false);
              handleDelete(selectedItem);
            }}
            fields={[
              { key: 'image', label: 'Image', type: 'image' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'sport_type', label: 'Type de sport' },
              { key: 'teams', label: 'Équipes', type: 'badges' },
              { key: 'video_url', label: 'Vidéo', type: 'url' },
              { key: 'is_active', label: 'Actif', type: 'boolean' },
              { key: 'is_new', label: 'Nouveau', type: 'boolean' },
              { key: 'views_count', label: 'Nombre de vues' },
              { key: 'likes_count', label: 'Nombre de likes' },
              { key: 'created_at', label: 'Date de création', type: 'date' },
              { key: 'updated_at', label: 'Dernière modification', type: 'date' }
            ]}
          />
        </Drawer>
      )}
    </div>
  );
}