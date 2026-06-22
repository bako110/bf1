import React from 'react';

const PALETTE = {
  blue:   { bg: '#EFF6FF', accent: '#3B82F6', text: '#1E40AF' },
  green:  { bg: '#F0FDF4', accent: '#22C55E', text: '#166534' },
  red:    { bg: '#FEF2F2', accent: '#E23E3E', text: '#991B1B' },
  purple: { bg: '#FAF5FF', accent: '#9C27B0', text: '#6B21A8' },
  yellow: { bg: '#FEFCE8', accent: '#EAB308', text: '#854D0E' },
  indigo: { bg: '#EEF2FF', accent: '#6366F1', text: '#3730A3' },
  pink:   { bg: '#FDF2F8', accent: '#EC4899', text: '#9D174D' },
  orange: { bg: '#FFF7ED', accent: '#F97316', text: '#9A3412' },
  teal:   { bg: '#F0FDFA', accent: '#14B8A6', text: '#134E4A' },
  cyan:   { bg: '#ECFEFF', accent: '#06B6D4', text: '#164E63' },
  gray:   { bg: '#F9FAFB', accent: '#6B7280', text: '#1F2937' },
};

export default function StatCard({ label = '', value = 0, trend = null, color = 'blue' }) {
  const p = PALETTE[color] ?? PALETTE.blue;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '20px 20px 16px',
      borderTop: `3px solid ${p.accent}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      {/* Pastille colorée + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: p.accent, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>

      {/* Valeur */}
      <p style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>
        {value.toLocaleString()}
      </p>

      {/* Tendance */}
      {trend !== null && trend !== undefined && (
        <p style={{
          fontSize: 11, marginTop: 8, margin: '8px 0 0',
          color: trend > 0 ? '#16A34A' : trend < 0 ? '#DC2626' : '#9CA3AF',
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <span>{trend > 0 ? '▲' : trend < 0 ? '▼' : '—'}</span>
          <span>{Math.abs(trend)}% ce mois</span>
        </p>
      )}
    </div>
  );
}
