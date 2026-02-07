import React, { useEffect, useState } from 'react';
import { fetchMovies, createMovie, updateMovie, deleteMovie, uploadMovieImage } from '../services/movieService';
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
    video_url: '',
    image_url: '',
    is_premium: false
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMovies();
      setMovies(data);
    } catch (e) {
      setError('Erreur lors du chargement des films.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateMovie(editId, form);
        setSuccess('Film modifié avec succès.');
      } else {
        await createMovie(form);
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


  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer ce film ?')) {
      try {
        await deleteMovie(id);
        setSuccess('Film supprimé.');
        loadMovies();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(movie) {
    setForm({ 
      title: movie.title, 
      description: movie.description || '', 
      genre: movie.genre || [],
      release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
      duration: movie.duration || 0,
      video_url: movie.video_url || '', 
      image_url: movie.image_url || '',
      is_premium: movie.is_premium || false
    });
    setEditId(movie.id);
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
      genre: [],
      release_date: '',
      duration: 0,
      video_url: '',
      image_url: '',
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

            <FormInput
              label="URL de la Vidéo"
              placeholder="https://exemple.com/video.mp4"
              type="url"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
            />

            <ImageUpload
              label="Affiche du Film"
              value={form.image_url}
              onChange={(url) => setForm({...form, image_url: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'affiche du film"
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
          </div>
        )}
      </div>
    </div>
  );
}
