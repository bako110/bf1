import React, { useEffect, useState } from 'react';
import { fetchMovies, createMovie, updateMovie, deleteMovie } from '../services/movieService';
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
import FileUpload from './ui/FileUpload';
import Pagination from './ui/Pagination';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: [],
    release_date: '',
    duration: 0,
    video_file: null,
    video_url: '',
    video_source: 'file',
    image_file: null,
    image_url: '',
    is_premium: false,
    allow_comments: true
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
  
  // États pour l'upload
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchMovies(page, itemsPerPage);
      if (append) {
        setMovies(prev => [...prev, ...data.items]);
      } else {
        setMovies(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des films.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadMovies(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadMovies(currentPage + 1, true);
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
          if (response.data?.duration) {
            setForm(prev => ({...prev, duration: Math.ceil(response.data.duration / 60)}));
          }
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
    setForm({...form, image_file: file});
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
          setForm(prev => ({...prev, image_url: imageUrl}));
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
      const movieData = {
        title: form.title,
        description: form.description,
        genre: form.genre,
        release_date: form.release_date,
        duration: parseInt(form.duration) || 0,
        video_url: form.video_url || null,
        image_url: form.image_url || null,
        is_premium: form.is_premium
      };
      
      if (editId) {
        await updateMovie(editId, movieData);
        setSuccess('Film modifié avec succès.');
      } else {
        await createMovie(movieData);
        setSuccess('Film créé avec succès.');
      }
      handleCloseDrawer();
      loadMovies();
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
      await deleteMovie(id);
      setSuccess('Film supprimé.');
      loadMovies();
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
      await updateMovie(itemId, { allow_comments: newStatus });
      setSuccess(`Commentaires ${newStatus ? 'activés' : 'désactivés'} avec succès.`);
      loadMovies();
    } catch (e) {
      setError('Erreur lors de la modification des commentaires.');
    }
  }

  function handleEdit(movie) {
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || [],
      release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
      duration: movie.duration || 0,
      video_file: null,
      video_url: movie.video_url || '',
      video_source: movie.video_url ? 'url' : 'file',
      image_file: null,
      is_premium: movie.is_premium || false,
      allow_comments: movie.allow_comments !== false
    });
    setEditId(movie.id);
    setIsDrawerOpen(true);
    setError('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      title: '',
      description: '',
      genre: [],
      release_date: '',
      duration: 0,
      video_file: null,
      video_url: '',
      video_source: 'file',
      image_file: null,
      image_url: '',
      is_premium: false,
      allow_comments: true
    });
    setError('');
    setUploadingVideo(false);
    setUploadVideoProgress(0);
    setUploadingImage(false);
    setUploadImageProgress(0);
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
    { 
      key: 'genre', 
      label: 'Genres',
      render: (val) => Array.isArray(val) ? val.join(', ') : '-'
    },
    { 
      key: 'duration', 
      label: 'Durée',
      render: (val) => val ? `${val} min` : '-'
    },
    { 
      key: 'is_premium', 
      label: 'Type',
      render: (val) => val ? '💎 Premium' : '🆓 Gratuit'
    },
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

  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Films"
          description="Créer et gérer le catalogue de films"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Film
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {movies.length > 0 && currentPage < totalPages && (
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
                  Charger plus de films ({movies.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? '✏️ Modifier le Film' : '➕ Nouveau Film'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <p className="text-sm text-purple-800">
                <strong>💡 Astuce :</strong> Remplissez tous les champs pour créer un film complet.
              </p>
            </div>

            <FormInput
              label="Titre du Film"
              placeholder="Le Destin de Koumba"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormInput
              label="Genres (séparés par des virgules)"
              placeholder="Drame, Romance, Action"
              value={form.genre.join(', ')}
              onChange={e => setForm({...form, genre: e.target.value.split(',').map(g => g.trim()).filter(g => g)})}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Date de Sortie"
                type="date"
                value={form.release_date}
                onChange={e => setForm({...form, release_date: e.target.value})}
              />

              <FormInput
                label="Durée (minutes)"
                type="number"
                placeholder="120"
                value={form.duration}
                onChange={e => setForm({...form, duration: parseInt(e.target.value) || 0})}
                min="0"
                max="500"
              />
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
                  required
                />
              )}
            </div>

            {/* Upload Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Affiche du Film <span className="text-red-500">*</span>
              </label>
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
                    <p className="text-sm text-purple-800 font-medium">Upload image en cours...</p>
                    <span className="text-sm text-purple-600">{uploadImageProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${uploadImageProgress}%` }} />
                  </div>
                </div>
              )}
              {form.image_url && !uploadingImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">Image uploadée avec succès</p>
                </div>
              )}
            </div>

            <FormTextarea
              label="Description"
              placeholder="Description détaillée du film..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
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
                  🚫 Désactiver les commentaires
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Cochez cette case si vous ne voulez pas autoriser les commentaires sur ce film.
                Les utilisateurs pourront voir le film mais ne pourront pas commenter.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input 
                type="checkbox" 
                id="is_premium"
                checked={form.is_premium} 
                onChange={e => setForm({...form, is_premium: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">💎 Film Premium (accès payant)</label>
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
                onClick={handleCloseDrawer}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des films..." />
        ) : movies.length === 0 ? (
          <EmptyState 
            icon="🎬"
            title="Aucun film"
            message="Créez votre premier film pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={movies}
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
        title="Supprimer le Film"
        message={`Êtes-vous sûr de vouloir supprimer le film "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
