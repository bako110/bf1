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
    image_file: null,
    is_premium: false
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      // Créer FormData pour l'upload de fichiers
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('genre', JSON.stringify(form.genre));
      formData.append('release_date', form.release_date);
      formData.append('duration', form.duration);
      formData.append('is_premium', form.is_premium);
      
      if (form.video_file) {
        formData.append('video_file', form.video_file);
      }
      
      if (form.image_file) {
        formData.append('image_file', form.image_file);
      }
      
      if (editId) {
        await updateMovie(editId, formData);
        setSuccess('Film modifié avec succès.');
      } else {
        await createMovie(formData);
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

  function handleEdit(movie) {
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || [],
      release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
      duration: movie.duration || 0,
      video_file: null,
      image_file: null,
      is_premium: movie.is_premium || false
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
      image_file: null,
      is_premium: false
    });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
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

            <FileUpload
              label="Fichier Vidéo"
              accept="video/*"
              maxSize={500 * 1024 * 1024} // 500MB pour les vidéos
              value={form.video_file}
              onChange={(file) => setForm({...form, video_file: file})}
              disabled={submitting}
              helperText="Sélectionnez le fichier vidéo du film (MP4, WebM, OGG, MOV)"
            />

            <FileUpload
              label="Affiche du Film"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB pour les images
              value={form.image_file}
              onChange={(file) => setForm({...form, image_file: file})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'affiche du film"
              showPreview={true}
            />

            <FormTextarea
              label="Description"
              placeholder="Description détaillée du film..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
            />

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
