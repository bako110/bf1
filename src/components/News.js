import React, { useEffect, useState } from 'react';
import { fetchNews, createNews, updateNews, deleteNews } from '../services/newsService';
import Drawer from './Drawer';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', content: '', image_url: '', author: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => { loadNews(); }, []);

  async function loadNews() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNews();
      setNews(data);
    } catch (e) {
      setError('Erreur lors du chargement des news.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateNews(editId, form);
        setSuccess('News modifiée avec succès.');
      } else {
        await createNews(form);
        setSuccess('News créée avec succès.');
      }
      setForm({ title: '', content: '', image_url: '', author: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadNews();
    } catch (e) {
      setError('Erreur lors de la sauvegarde de la news.');
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Supprimer cette news ?')) {
      try {
        await deleteNews(id);
        setSuccess('News supprimée.');
        loadNews();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(n) {
    setForm({ title: n.title, content: n.content || '', image_url: n.image_url || '', author: n.author || '' });
    setEditId(n.id);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', content: '', image_url: '', author: '' });
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Gestion des News</h2>
            <p className="text-gray-600">Gérer les actualités</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            + Nouvelle News
          </button>
        </div>

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier la News' : 'Nouvelle News'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Titre</label>
              <input 
                placeholder="Titre de la news" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                required 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Auteur</label>
              <input 
                placeholder="Nom de l'auteur" 
                value={form.author} 
                onChange={e => setForm({ ...form, author: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">URL de l'image</label>
              <input 
                placeholder="https://..." 
                value={form.image_url} 
                onChange={e => setForm({ ...form, image_url: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Contenu</label>
              <textarea 
                placeholder="Contenu de la news" 
                value={form.content} 
                onChange={e => setForm({ ...form, content: e.target.value })} 
                required 
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
              />
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Contenu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {news.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Aucune news
                    </td>
                  </tr>
                ) : (
                  news.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{n.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{n.author || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{n.content?.substring(0, 60) + '...' || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleEdit(n)} 
                          className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold mr-2 hover:bg-black transition-colors"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => handleDelete(n.id)} 
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
