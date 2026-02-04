import React, { useEffect, useState } from 'react';
import { fetchMovies, createMovie, updateMovie, deleteMovie, uploadMovieImage } from '../services/movieService';
import Drawer from './Drawer';

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

  async function handleDelete(id) {
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
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Gestion des Films</h2>
            <p className="text-gray-600">Gérer le catalogue de films</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            + Nouveau Film
          </button>
        </div>

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier le Film' : 'Nouveau Film'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Titre</label>
              <input 
                placeholder="Titre du film" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                required 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">URL de la vidéo</label>
              <input 
                placeholder="https://..." 
                value={form.video_url} 
                onChange={e => setForm({ ...form, video_url: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Affiche</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
              {imageUploading && (
                <div className="text-xs text-gray-600 mt-2">Upload en cours...</div>
              )}
              {!!form.image_url && (
                <div className="mt-3">
                  <img
                    src={form.image_url}
                    alt=""
                    className="h-24 w-24 object-cover border border-gray-300"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Description</label>
              <textarea 
                placeholder="Description du film" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.is_premium} 
                  onChange={e => setForm({ ...form, is_premium: e.target.checked })} 
                  className="w-5 h-5 text-black rounded focus:ring-1 focus:ring-black"
                />
                <span className="text-sm font-semibold text-black">Film Premium</span>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={imageUploading}
                className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
              >
                {editId ? 'Modifier' : 'Créer'}
              </button>
              <button 
                type="button" 
                onClick={handleCloseDrawer}
                className="bg-gray-300 text-black px-6 py-3 font-semibold hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Drawer>

        {success && <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">{success}</div>}
        {error && <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Aucun film
                    </td>
                  </tr>
                ) : (
                  movies.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{m.title}</td>
                      <td className="px-6 py-4 text-sm">
                        {m.image_url ? (
                          <img
                            src={m.image_url}
                            alt=""
                            className="h-10 w-10 object-cover border border-gray-300"
                          />
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{m.description?.substring(0, 60) + '...' || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 text-xs font-semibold ${
                          m.is_premium ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {m.is_premium ? 'Premium' : 'Gratuit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleEdit(m)} 
                          className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold mr-2 hover:bg-black transition-colors"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)} 
                          className="bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-gray-800 transition-colors"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
