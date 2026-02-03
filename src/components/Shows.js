import React, { useEffect, useState } from 'react';
import { fetchShows, createShow, updateShow, deleteShow } from '../services/showService';
import Drawer from './Drawer';

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', host: '', category: '', replay_url: '', live_url: '', is_live: false });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchShows();
      setShows(data);
    } catch (e) {
      setError('Erreur lors du chargement des émissions.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createShow(form);
        setSuccess('Émission créée avec succès.');
      }
      setForm({ title: '', description: '', host: '', category: '', replay_url: '', live_url: '', is_live: false });
      setEditId(null);
      setIsDrawerOpen(false);
      loadShows();
    } catch (e) {
      setError('Erreur lors de la sauvegarde de l\'émission.');
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer cette émission ?')) {
      try {
        await deleteShow(id);
        setSuccess('Émission supprimée.');
        loadShows();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(show) {
    setForm({ 
      title: show.title, 
      description: show.description || '', 
      host: show.host || '',
      category: show.category || '',
      replay_url: show.replay_url || '',
      live_url: show.live_url || '',
      is_live: show.is_live || false
    });
    setEditId(show.id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', description: '', host: '', category: '', replay_url: '', live_url: '', is_live: false });
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Gestion des Émissions</h2>
            <p className="text-gray-600">Gérer le catalogue d'émissions</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            + Nouvelle Émission
          </button>
        </div>

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier l\'Émission' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Titre</label>
              <input 
                placeholder="Titre de l'émission" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                required 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Animateur</label>
              <input 
                placeholder="Nom de l'animateur" 
                value={form.host} 
                onChange={e => setForm({ ...form, host: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Catégorie</label>
              <input 
                placeholder="Catégorie" 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">URL du replay</label>
              <input 
                placeholder="https://..." 
                value={form.replay_url} 
                onChange={e => setForm({ ...form, replay_url: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">URL du live</label>
              <input 
                placeholder="https://..." 
                value={form.live_url} 
                onChange={e => setForm({ ...form, live_url: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Description</label>
              <textarea 
                placeholder="Description de l'émission" 
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
                  checked={form.is_live} 
                  onChange={e => setForm({ ...form, is_live: e.target.checked })} 
                  className="w-5 h-5 text-black rounded focus:ring-1 focus:ring-black"
                />
                <span className="text-sm font-semibold text-black">En direct</span>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Animateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Aucune émission
                    </td>
                  </tr>
                ) : (
                  shows.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{s.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.host || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.category || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 text-xs font-semibold ${
                          s.is_live ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {s.is_live ? 'En direct' : 'Replay'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleEdit(s)} 
                          className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold mr-2 hover:bg-black transition-colors"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)} 
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
