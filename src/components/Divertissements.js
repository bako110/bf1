import React, { useEffect, useState } from 'react';
import { fetchDivertissements, createDivertissement, updateDivertissement, deleteDivertissement, deleteBatchDivertissements } from '../services/divertissementService';
import { uploadVideo } from '../services/uploadService'; // Service d'upload vidéo
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
import ImageUpload from './ui/ImageUpload'; // Composant ImageUpload
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';
import DetailView from './ui/DetailView';
import { fetchCategories } from '../services/categoryService';

export default function Divertissements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    video_url: '',
    video_file: null,
    video_source: 'file',
    allow_comments: true,
    created_at: ''
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  
  // États pour l'upload vidéo
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categories, setCategories] = useState([]);

  // États pour la vue détaillée
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadDivertissements();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await fetchCategories('divertissement', false);
      setCategories(data || []);
    } catch (e) {
      console.error('Erreur chargement catégories:', e);
    }
  }

  async function loadDivertissements(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchDivertissements(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage) || 1);
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des divertissements.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadDivertissements(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadDivertissements(currentPage + 1, true);
    }
  };

  // Upload automatique vidéo avec uploadsService
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
    } finally {
      setUploadingVideo(false);
      setUploadVideoProgress(0);
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
    
    if (!form.video_url && !editId) {
      setError('Veuillez sélectionner une vidéo');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        image: form.image || null,
        video_url: form.video_url || null,
        allow_comments: form.allow_comments,
        ...(form.created_at ? { created_at: new Date(form.created_at).toISOString() } : {})
      };
      
      if (editId) {
        await updateDivertissement(editId, payload);
        setSuccess('Divertissement modifié avec succès.');
      } else {
        await createDivertissement(payload);
        setSuccess('Divertissement créé avec succès.');
      }
      handleClose();
      loadDivertissements();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      title: '', 
      category: '', 
      description: '', 
      image: '', 
      video_url: '', 
      video_file: null,
      video_source: 'file',
      allow_comments: true,
      created_at: ''
    });
    setError('');
    setUploadingVideo(false);
    setUploadVideoProgress(0);
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  function handleBulkDelete() {
    setItemToDelete(null);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    const idsToDelete = itemToDelete ? [itemToDelete.id || itemToDelete._id] : selectedIds;
    if (!idsToDelete.length) return;
    setError('');
    setSuccess('');
    try {
      if (itemToDelete) {
        await deleteDivertissement(idsToDelete[0]);
      } else {
        await deleteBatchDivertissements(idsToDelete);
      }
      const count = idsToDelete.length;
      setSuccess(`${count} element${count > 1 ? 's supprime(s)' : ' supprime'}.`);
      setSelectedIds([]);
      loadDivertissements();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  async function handleToggleComments(item) {
    const itemId = item.id || item._id;
    const newStatus = !item.allow_comments;
    
    try {
      await updateDivertissement(itemId, { allow_comments: newStatus });
      setSuccess(`Commentaires ${newStatus ? 'activés' : 'désactivés'} avec succès.`);
      loadDivertissements();
    } catch (e) {
      setError('Erreur lors de la modification des commentaires.');
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      video_url: item.video_url || '',
      video_file: null,
      video_source: item.video_url ? 'url' : 'file',
      allow_comments: item.allow_comments !== false,
      created_at: item.created_at ? new Date(item.created_at).toISOString().slice(0, 16) : ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

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
    { key: 'category', label: 'Catégorie' },
    { 
      key: 'allow_comments', 
      label: 'Commentaires',
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
              Désactivés
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Activés
            </>
          )}
        </span>
      )
    },
  ];

  const actions = [
    { 
      label: 'Modifier', 
      onClick: handleEdit, 
      className: 'text-blue-600 hover:text-blue-800',
      icon: 'edit'
    },
    { 
      label: 'Basculer commentaires', 
      onClick: (item) => handleToggleComments(item), 
      className: 'text-orange-600 hover:text-orange-800',
      icon: 'comments'
    },
    { 
      label: 'Supprimer', 
      onClick: handleDelete, 
      className: 'text-red-600 hover:text-red-800',
      icon: 'delete'
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
          title="Gestion des Divertissements"
          description="Créer et gérer les divertissements"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Divertissement
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm font-medium text-red-800">{selectedIds.length} element{selectedIds.length > 1 ? 's' : ''} selectionne{selectedIds.length > 1 ? 's' : ''}</span>
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">Supprimer la selection</button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors">Annuler</button>
          </div>
        )}

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
                  Charger plus de divertissements ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier le Divertissement' : 'Nouveau Divertissement'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput 
              label="Titre du divertissement" 
              placeholder="Titre du divertissement" 
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
            
            <FormTextarea 
              label="Description (optionnel)" 
              placeholder="Description ou contenu..." 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              rows={4} 
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
                        onChange={e => handleVideoSelect(e.target.files[0])}
                        required={!editId}
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
                      <p className="text-sm text-green-800"> Vidéo uploadée</p>
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
                  required
                />
              )}
            </div>

            {/* Upload Image avec ImageUpload */}
            <ImageUpload
              label="Image du Divertissement"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour le divertissement (JPG, PNG, GIF, WebP - max 5MB)"
              required
            />

            {/* Option pour désactiver les commentaires */}
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!form.allow_comments}
                  onChange={e => setForm({...form, allow_comments: !e.target.checked})}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                   Désactiver les commentaires
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Cochez cette case si vous ne voulez pas autoriser les commentaires sur ce divertissement.
                Les utilisateurs pourront voir le divertissement mais ne pourront pas commenter.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
              <input
                type="datetime-local"
                value={form.created_at}
                onChange={e => setForm({...form, created_at: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Modifie la date d'apparition dans les classements</p>
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
          <Loader size="lg" text="Chargement des divertissements..." />
        ) : items.length === 0 ? (
          <EmptyState icon="" title="Aucun divertissement" message="Créez votre premier divertissement." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns} 
              data={items} 
              actions={actions} 
              onRowClick={handleRowClick}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
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
        title="Supprimer"
        message={itemToDelete
          ? `Supprimer "${itemToDelete.title}" ? Cette action est irreversible.`
          : `Supprimer ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''} ? Cette action est irreversible.`
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Vue détaillée */}
      {showDetailView && selectedItem && (
        <Drawer
          isOpen={showDetailView}
          onClose={() => {
            setShowDetailView(false);
            setSelectedItem(null);
          }}
          title="Détails du divertissement"
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
              { key: 'category', label: 'Catégorie' },
              { key: 'video_url', label: 'Vidéo', type: 'url' },
              { key: 'allow_comments', label: 'Commentaires autorisés', type: 'boolean' },
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