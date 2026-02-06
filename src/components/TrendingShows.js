import React, { useEffect, useState } from 'react';
import { fetchTrendingShows, createTrendingShow, updateTrendingShow, deleteTrendingShow } from '../services/trendingShowService';
import Drawer from './Drawer';

export default function TrendingShows() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', rank: 1, genre: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadTrendingShows();
  }, []);

  async function loadTrendingShows() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrendingShows();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des émissions tendances.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateTrendingShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createTrendingShow(form);
        setSuccess('Émission créée avec succès.');
      }
      setForm({ title: '', description: '', rank: 1, genre: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadTrendingShows();
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
    }
  }

  async function handleDelete(item) {
    const itemId = item.id || item._id;
    if (window.confirm('Supprimer cette émission ?')) {
      try {
        await deleteTrendingShow(itemId);
        setSuccess('Émission supprimée.');
        loadTrendingShows();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      description: item.description || '',
      rank: item.rank || 1,
      genre: item.genre || ''
    });
    setEditId(item.id);
    setIsDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Gestion des Émissions Tendances</h2>
            <p className="text-gray-600">Gérer les émissions populaires du moment</p>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800">+ Nouvelle Émission</button>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-300 text-red-800 p-4">{error}</div>}
        {success && <div className="mb-6 bg-green-50 border border-green-300 text-green-800 p-4">{success}</div>}

        <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setEditId(null);}} title={editId ? 'Modifier' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Titre" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="Rang" value={form.rank} onChange={e => setForm({...form, rank: parseInt(e.target.value)})} type="number" min="1" className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="Genre" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full px-4 py-2 border border-gray-300" />
            <button type="submit" className="w-full bg-black text-white py-2 font-semibold">Enregistrer</button>
          </form>
        </Drawer>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="border border-gray-300 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 font-semibold">Rang</th>
                  <th className="px-6 py-3 font-semibold">Titre</th>
                  <th className="px-6 py-3 font-semibold">Genre</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="px-6 py-3">#{item.rank}</td>
                    <td className="px-6 py-3">{item.title}</td>
                    <td className="px-6 py-3">{item.genre}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-black hover:underline">Modifier</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
