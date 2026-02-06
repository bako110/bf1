import React, { useEffect, useState } from 'react';
import { fetchPopularPrograms, createPopularProgram, updatePopularProgram, deletePopularProgram } from '../services/popularProgramsService';
import Drawer from './Drawer';

export default function PopularPrograms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPopularPrograms();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updatePopularProgram(editId, form);
        setSuccess('Programme modifié avec succès.');
      } else {
        await createPopularProgram(form);
        setSuccess('Programme créé avec succès.');
      }
      setForm({ title: '', description: '', category: '', schedule: '', episodes: 0, image: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadPrograms();
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
    }
  }

  async function handleDelete(item) {
    const itemId = item?.id || item?._id;
    if (!itemId) {
      setError('Erreur: ID du programme introuvable.');
      return;
    }
    if (window.confirm('Supprimer ce programme ?')) {
      try {
        await deletePopularProgram(itemId);
        setSuccess('Programme supprimé.');
        loadPrograms();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      description: item.description || '',
      category: item.category || '',
      schedule: item.schedule || '',
      episodes: item.episodes || 0,
      image: item.image || ''
    });
    setEditId(item.id);
    setIsDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Programmes Populaires</h2>
            <p className="text-gray-600">Gérer les programmes les plus populaires</p>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800">+ Nouveau Programme</button>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-300 text-red-800 p-4">{error}</div>}
        {success && <div className="mb-6 bg-green-50 border border-green-300 text-green-800 p-4">{success}</div>}

        <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setEditId(null);}} title={editId ? 'Modifier' : 'Nouveau Programme'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Titre" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} required className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="Horaire (ex: 20:00)" value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} required className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="Nombre d'épisodes" type="number" value={form.episodes} onChange={e => setForm({...form, episodes: parseInt(e.target.value) || 0})} required min="0" className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="Catégorie" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="w-full px-4 py-2 border border-gray-300" />
            <input placeholder="URL de l'image" type="url" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2 border border-gray-300" />
            <p className="text-sm text-gray-500">Note: La note est générée automatiquement par les utilisateurs</p>
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
                  <th className="px-6 py-3 font-semibold">Titre</th>
                  <th className="px-6 py-3 font-semibold">Catégorie</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="px-6 py-3">{item.title}</td>
                    <td className="px-6 py-3">{item.category}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-black hover:underline">Modifier</button>
                      <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline">Supprimer</button>
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
