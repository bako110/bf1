import React, { useState } from 'react';
import { loginAdmin } from '../services/authService';

const RED      = '#E23E3E';
const RED_DARK = '#C93535';
const GRAY1    = '#111827';
const GRAY3    = '#6B7280';
const GRAY4    = '#9CA3AF';
const BORDER   = '#E5E7EB';

export default function AdminLogin({ onLogin }) {
  const [identifier,    setIdentifier]    = useState('');
  const [password,      setPassword]      = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [focusedField,  setFocusedField]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(identifier, password);
      onLogin();
    } catch {
      setError('Identifiants invalides ou erreur serveur');
    }
    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    color: GRAY1,
    background: '#fff',
    border: `1.5px solid ${focusedField === field ? RED : BORDER}`,
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F5 0%, #F9FAFB 50%, #FFF0F0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      {/* Cercle décoratif haut-gauche */}
      <div style={{
        position: 'fixed', top: -80, left: -80,
        width: 280, height: 280, borderRadius: '50%',
        background: `rgba(226,62,62,0.07)`,
        pointerEvents: 'none',
      }} />
      {/* Cercle décoratif bas-droite */}
      <div style={{
        position: 'fixed', bottom: -60, right: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: `rgba(226,62,62,0.05)`,
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>

        {/* Carte principale */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(226,62,62,0.12), 0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>

          {/* ── En-tête rouge avec logo ─────────────────── */}
          <div style={{
            background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)`,
            padding: '36px 32px 28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Cercle décoratif derrière le logo */}
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: -20, left: -20,
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }} />

            {/* Logo BF1 */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 88,
              height: 88,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              marginBottom: 14,
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.25)',
            }}>
              <img
                src="/logo.png"
                alt="BF1"
                style={{ width: 70, height: 70, objectFit: 'contain' }}
              />
            </div>

            <h1 style={{
              fontSize: 13, fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 3, textTransform: 'uppercase',
              margin: 0,
            }}>
              Administration
            </h1>
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.60)',
              margin: '4px 0 0',
            }}>
              Connexion sécurisée
            </p>
          </div>

          {/* ── Formulaire ──────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 32px 24px' }}>

            {/* Identifiant */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: GRAY1, marginBottom: 6, letterSpacing: 0.3,
              }}>
                Identifiant
              </label>
              <input
                type="text"
                placeholder="Email, username ou téléphone"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onFocus={() => setFocusedField('id')}
                onBlur={() => setFocusedField(null)}
                required
                autoFocus
                autoComplete="username"
                style={inputStyle('id')}
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: GRAY1, marginBottom: 6, letterSpacing: 0.3,
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pw')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle('pw'), paddingRight: 80 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 11, fontWeight: 600, color: GRAY3,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                marginBottom: 18,
                padding: '10px 14px',
                background: 'rgba(226,62,62,0.06)',
                border: `1px solid rgba(226,62,62,0.25)`,
                borderRadius: 8,
                borderLeft: `3px solid ${RED}`,
                fontSize: 13, color: RED,
              }}>
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: loading
                  ? GRAY4
                  : `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
                boxShadow: loading ? 'none' : `0 4px 14px rgba(226,62,62,0.35)`,
                transition: 'opacity 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* ── Pied de carte ───────────────────────────── */}
          <div style={{
            padding: '12px 32px 20px',
            textAlign: 'center',
            borderTop: `1px solid ${BORDER}`,
          }}>
            <p style={{ fontSize: 11, color: GRAY4, margin: 0 }}>
              © {new Date().getFullYear()} BF1 TV — Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
