import React from 'react';
import { logoutAdmin } from '../services/authService';

const sections = [
  { label: 'Dashboard',               key: 'dashboard',         icon: '▦' },
  { label: 'Utilisateurs',            key: 'users',             icon: '◎' },
  { label: 'Contenu',                 key: 'submenu_content',   isHeader: true },
  { label: 'Journal',                 key: 'jtandmag',          icon: '◈' },
  { label: 'Magazine',                key: 'magazine',          icon: '◉' },
  { label: 'Flash info',              key: 'breakingNews',      icon: '◆' },
  { label: 'Sports',                  key: 'sports',            icon: '◇' },
  { label: 'Reportages',              key: 'reportage',         icon: '◎' },
  { label: 'Divertissements',         key: 'divertissement',    icon: '◈' },
  { label: 'Reel',                    key: 'reel',              icon: '▷' },
  { label: 'Télé Réalité',            key: 'teleRealite',       icon: '◉' },
  { label: 'Archives',                key: 'archives',          icon: '◫' },
  { label: 'Contenus Manqués',        key: 'missed',            icon: '◁' },
  { label: 'Gestion',                 key: 'submenu_gestion',   isHeader: true },
  { label: 'Contrôle Live',           key: 'liveControl',       icon: '◉' },
  { label: 'Modération Live',         key: 'liveModeration',    icon: '◈' },
  { label: 'Calendrier',              key: 'programs',          icon: '▦' },
  { label: 'Catégories',              key: 'categories',        icon: '◈' },
  { label: "Catégories d'Émissions",  key: 'emissionCategories',icon: '◈' },
  { label: 'Notifications Push',      key: 'notifications',     icon: '◆' },
  { label: 'Abonnements',             key: 'submenu_subscriptions', isHeader: true },
  { label: "Plans d'Abonnement",      key: 'subscriptionPlans', icon: '◇' },
  { label: 'Abonnements Utilisateurs',key: 'subscriptions',     icon: '◎' },
  { label: 'Système',                 key: 'submenu_system',    isHeader: true },
  { label: 'Contact',                 key: 'contact',           icon: '◈' },
  { label: 'Paramètres',              key: 'settings',          icon: '◉' },
];

/* ── couleurs BF1 ──────────────────────────────────────── */
const RED       = '#E23E3E';   // accent uniquement
const RED_DARK  = '#C93535';
const RED_LIGHT = 'rgba(255,255,255,0.15)';
const RED_HOVER = 'rgba(255,255,255,0.08)';
const WHITE     = '#FFFFFF';
const WHITE60   = 'rgba(255,255,255,0.60)';
const WHITE80   = 'rgba(255,255,255,0.80)';
const WHITE30   = 'rgba(255,255,255,0.30)';
const WHITE12   = 'rgba(255,255,255,0.10)';

export default function Sidebar({ currentSection, onSectionChange, onLogout }) {
  const handleLogout = () => { logoutAdmin(); onLogout?.(); };

  return (
    <aside style={{
      width: 256, minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0,
      background: 'linear-gradient(180deg, #7a1a1a 0%, #5c1212 100%)',
      boxShadow: '4px 0 16px rgba(0,0,0,0.18)',
    }}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${WHITE12}`,
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <img
          src="/logo.png"
          alt="BF1"
          style={{ width: 56, height: 56, objectFit: 'contain' }}
        />
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 3,
          color: WHITE60, textTransform: 'uppercase',
        }}>Administration</div>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sections.map((s) => {
            if (s.isHeader) {
              return (
                <li key={s.key} style={{
                  padding: '18px 20px 6px',
                  fontSize: 9, fontWeight: 800, letterSpacing: 2.5,
                  textTransform: 'uppercase', color: WHITE60,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ flex: 1, height: 1, background: WHITE12 }} />
                  <span>{s.label}</span>
                  <span style={{ flex: 1, height: 1, background: WHITE12 }} />
                </li>
              );
            }

            const active = currentSection === s.key;
            return (
              <li key={s.key}>
                <button
                  onClick={() => onSectionChange(s.key)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    color: active ? WHITE : WHITE80,
                    background: active ? RED_LIGHT : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${active ? WHITE : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = RED_HOVER;
                      e.currentTarget.style.color = WHITE;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = WHITE80;
                    }
                  }}
                >
                  <span style={{ fontSize: 11, width: 16, textAlign: 'center', color: active ? WHITE : WHITE60 }}>
                    {s.icon}
                  </span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  {active && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: WHITE, flexShrink: 0,
                    }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div style={{ padding: 16, borderTop: `1px solid ${WHITE12}` }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '10px 16px',
            background: 'rgba(0,0,0,0.20)',
            color: WHITE, border: `1px solid ${WHITE30}`,
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 4, transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.20)'; }}
        >
          <span style={{ fontSize: 14 }}>⏻</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
