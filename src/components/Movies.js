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

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', video_url: '', image_url: '', is_premium: false });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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
    try {
      if (editId) {
        await updateMovie(editId, form);
        setSuccess('Film modifié avec succès.');
      } else {
        await createMovie(form);
        setSuccess('Film créé avec succès.');
      }
      setForm({ title: '', description: '', video_url: '', image_url: '', is_premium: false });
      setEditId(null);
      setIsDrawerOpen(false);
      loadMovies();
    } catch (e) {
      setError('Erreur lors de la sauvegarde du film.');
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSuccess('');
    setImageUploading(true);
    try {
      const result = await uploadMovieImage(file);
      setForm((prev) => ({ ...prev, image_url: result.url }));
    } catch (err) {
      setError("Erreur lors de l'upload de l'image.");
    } finally {
      setImageUploading(false);
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
    setForm({ title: '', description: '', video_url: '', image_url: '', is_premium: false });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { 
      key: 'image_url', 
      label: 'Image',
      render: (val) => val ? '✓' : '✗'
    },
    { 
      key: 'is_premium', 
      label: 'Type',
      render: (val) => val ? 'Premium' : 'Gratuit'
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

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier le Film' : 'Nouveau Film'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Titre du film"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="URL de la vidéo"
              placeholder="https://exemple.com"
              type="url"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Affiche</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
              {imageUploading && (
                <div className="text-sm text-blue-600 mt-2">Upload en cours...</div>
              )}
              {!!form.image_url && (
                <div className="mt-3">
                  <img
                    src={form.image_url}
                    alt="Aperçu"
                    className="h-32 w-24 object-cover border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
            <FormTextarea
              label="Description"
              placeholder="Description du film..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_premium"
                checked={form.is_premium} 
                onChange={e => setForm({...form, is_premium: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">Film Premium</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
                disabled={imageUploading}
              >
                {editId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleCloseDrawer}
              >
                Annuler
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
