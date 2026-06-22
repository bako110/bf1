import React, { useEffect, useState } from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import api from '../config/api';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';

const RED = '#E23E3E';

const cardData = [
  { key: 'users',           label: 'Utilisateurs',    color: 'blue',   nav: 'users',           icon: '◎' },
  { key: 'sports',          label: 'Sports',           color: 'red',    nav: 'sports',          icon: '◇' },
  { key: 'reportages',      label: 'Reportages',       color: 'indigo', nav: 'reportage',       icon: '◎' },
  { key: 'reels',           label: 'Reels',            color: 'pink',   nav: 'reel',            icon: '▷' },
  { key: 'divertissements', label: 'Divertissements',  color: 'orange', nav: 'divertissement',  icon: '◈' },
  { key: 'tele_realite',    label: 'Télé-réalité',     color: 'teal',   nav: 'teleRealite',     icon: '◉' },
  { key: 'programs',        label: 'Programmes EPG',   color: 'cyan',   nav: 'programs',        icon: '▦' },
  { key: 'news',            label: 'Breaking News',    color: 'red',    nav: 'breakingNews',    icon: '◆' },
  { key: 'jtandmag',        label: 'Journal',          color: 'yellow', nav: 'jtandmag',        icon: '◈' },
  { key: 'magazine',        label: 'Magazine',         color: 'purple', nav: 'magazine',        icon: '◉' },
  { key: 'archives',        label: 'Archives',         color: 'gray',   nav: 'archives',        icon: '◫' },
  { key: 'missed',          label: "Vous l'avez raté", color: 'green',  nav: 'missed',          icon: '◁' },
];

const ACCENT_PALETTE = {
  blue: '#3B82F6', green: '#22C55E', red: '#E23E3E',
  purple: '#9C27B0', yellow: '#EAB308', indigo: '#6366F1',
  pink: '#EC4899', orange: '#F97316', teal: '#14B8A6',
  cyan: '#06B6D4', gray: '#6B7280',
};

export default function Dashboard({ onNavigate }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true); setError('');
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (e) {
        setError(extractErrorMessage(e, 'Erreur lors du chargement des statistiques'));
        setStats(Object.fromEntries(
          ['users','movies','reportages','reels','divertissements','programs',
           'news','jtandmag','subscriptions','comments','likes','favorites',
           'sports','tele_realite','magazine','archives','missed']
            .map(k => [k, { total: 0, growth: 0 }])
        ));
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const maxValue = stats ? Math.max(...Object.values(stats).map(s => s.total), 1) : 1;
  const total    = stats ? cardData.reduce((s, c) => s + (stats[c.key]?.total || 0), 0) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '32px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader
          title="Tableau de Bord"
          description="Vue d'ensemble complète de votre plateforme BF1"
        />

        {loading ? (
          <Loader size="lg" text="Chargement des statistiques..." />
        ) : error && !stats ? (
          <Alert type="error" title="Erreur" message={error} />
        ) : (
          <>
            {/* ── Résumé rapide ─────────────────────────── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16, marginBottom: 28,
            }}>
              {[
                { label: 'Total contenus', value: total, color: RED },
                { label: 'Utilisateurs',   value: stats?.users?.total ?? 0,         color: '#3B82F6' },
                { label: 'Abonnements',    value: stats?.subscriptions?.total ?? 0, color: '#22C55E' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
                  padding: '18px 22px',
                  borderLeft: `4px solid ${item.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Cartes stats ──────────────────────────── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16, marginBottom: 28,
            }}>
              {cardData.map(card => (
                <div
                  key={card.key}
                  onClick={() => onNavigate?.(card.nav)}
                  style={{ cursor: 'pointer' }}
                >
                  <StatCard
                    label={card.label}
                    value={stats?.[card.key]?.total ?? 0}
                    color={card.color}
                    trend={stats?.[card.key]?.growth}
                  />
                </div>
              ))}
            </div>

            {/* ── Barres de comparaison ─────────────────── */}
            <div style={{
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 12, padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>
                Comparaison des contenus
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cardData.map(card => {
                  const val = stats?.[card.key]?.total ?? 0;
                  const pct = (val / maxValue) * 100;
                  const accent = ACCENT_PALETTE[card.color] ?? RED;
                  return (
                    <div
                      key={card.key}
                      onClick={() => onNavigate?.(card.nav)}
                      style={{
                        cursor: 'pointer', padding: '6px 8px', borderRadius: 6,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 5,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{card.label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{val.toLocaleString()}</span>
                      </div>
                      <div style={{
                        width: '100%', height: 5, background: '#F3F4F6',
                        borderRadius: 3, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: accent, borderRadius: 3,
                          transition: 'width 0.6s ease-out',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
