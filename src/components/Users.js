import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/userService';
import Drawer from './Drawer';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError('Erreur lors du chargement des utilisateurs.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateUser(editId, form);
        setSuccess('Utilisateur modifié avec succès.');
      } else {
        await createUser(form);
        setSuccess('Utilisateur créé avec succès.');
      }
      setForm({ username: '', email: '', password: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadUsers();
    } catch (e) {
      setError('Erreur lors de la sauvegarde de l’utilisateur.');
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await deleteUser(id);
        setSuccess('Utilisateur supprimé.');
        loadUsers();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(user) {
    setForm({ username: user.username, email: user.email, password: '' });
    setEditId(user.id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ username: '', email: '', password: '' });
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Gestion des Utilisateurs</h2>
            <p className="text-gray-600">Gérer les comptes utilisateurs de la plateforme</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            + Nouvel Utilisateur
          </button>
        </div>

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Nom d'utilisateur</label>
              <input 
                placeholder="Nom d'utilisateur" 
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
                required 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Email</label>
              <input 
                placeholder="email@example.com" 
                type="email" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                required 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Mot de passe {!editId && <span className="text-gray-500">(min. 6 caractères)</span>}</label>
              <input 
                placeholder="••••••••" 
                type="password" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                required={!editId} 
                minLength={6} 
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
              {editId && <p className="text-xs text-gray-500 mt-1">Laissez vide pour ne pas changer</p>}
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{u.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 text-xs font-semibold ${
                          u.is_premium ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {u.is_premium ? 'Premium' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleEdit(u)} 
                          className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold mr-2 hover:bg-black transition-colors"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
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
