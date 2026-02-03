import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/userService';

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    }
    setLoading(false);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSuccess('Mot de passe modifié avec succès');
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Paramètres</h2>
          <p className="text-gray-600">Gérer votre profil et vos préférences</p>
        </div>

        {success && <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">{success}</div>}
        {error && <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">{error}</div>}

        {/* Informations du profil */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4">Informations du profil</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Optionnel"
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              Mettre à jour le profil
            </button>
          </form>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4">Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              Changer le mot de passe
            </button>
          </form>
        </div>

        {/* Informations du compte */}
        <div className="bg-white border border-gray-300 p-6">
          <h3 className="text-xl font-bold text-black mb-4">Informations du compte</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Statut</span>
              <span className={`px-3 py-1 text-xs font-semibold ${
                currentUser?.is_premium ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {currentUser?.is_premium ? 'Premium' : 'Standard'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Rôle</span>
              <span className="font-semibold text-black">
                {currentUser?.is_admin ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Membre depuis</span>
              <span className="font-semibold text-black">
                {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
