import React, { useState } from 'react';
import { loginAdmin } from '../services/authService';

export default function AdminLogin({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(identifier, password);
      onLogin();
    } catch (err) {
      setError('Identifiants invalides ou erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-300 shadow-lg">
          {/* Header */}
          <div className="bg-black text-white p-8 text-center">
            <div className="text-4xl font-black tracking-wider mb-3">BF1</div>
            <h1 className="text-xl font-bold tracking-wide">Administration</h1>
            <p className="text-sm text-gray-300 mt-2">Connexion sécurisée</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Email, username ou téléphone"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-gray-100 border-l-4 border-black px-4 py-3 text-sm text-gray-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-300">
            <p className="text-xs text-gray-500">© 2024 BF1 TV</p>
          </div>
        </div>
      </div>
    </div>
  );
}
