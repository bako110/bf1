import React from 'react';
import { Plus, Edit2, Trash2, X, Copy, Layers, PlayCircle, Save, ArrowLeft, ArrowRight } from 'lucide-react';

const RED      = '#E23E3E';
const RED_DARK = '#C93535';

const VARIANTS = {
  primary:   { background: RED,       color: '#fff', border: 'none',                      hoverBg: RED_DARK   },
  secondary: { background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB',      hoverBg: '#E5E7EB'  },
  danger:    { background: '#DC2626', color: '#fff', border: 'none',                      hoverBg: '#B91C1C'  },
  success:   { background: '#16A34A', color: '#fff', border: 'none',                      hoverBg: '#15803D'  },
  ghost:     { background: '#fff',    color: '#374151', border: '1px solid #E5E7EB',      hoverBg: '#F9FAFB'  },
};

const SIZES = {
  sm: { padding: '5px 10px',  fontSize: 11 },
  md: { padding: '8px 14px',  fontSize: 13 },
  lg: { padding: '11px 20px', fontSize: 15 },
};

const ICONS = {
  plus:        <Plus />,
  edit:        <Edit2 />,
  'trash-2':   <Trash2 />,
  delete:      <Trash2 />,
  x:           <X />,
  close:       <X />,
  copy:        <Copy />,
  layers:      <Layers />,
  'play-circle': <PlayCircle />,
  save:        <Save />,
  'arrow-left':  <ArrowLeft />,
  'arrow-right': <ArrowRight />,
};

export default function Button({
  children, onClick = () => {}, variant = 'primary', size = 'md',
  disabled = false, fullWidth = false, type = 'button', icon, loading = false, className = '',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size]       ?? SIZES.md;
  const iconEl = icon ? ICONS[icon] ?? null : null;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
        background: v.background, color: v.color, border: v.border,
        borderRadius: 8, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'background 0.15s, opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = v.background; }}
    >
      {loading
        ? <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        : iconEl && React.cloneElement(iconEl, { style: { width: size === 'sm' ? 12 : size === 'lg' ? 18 : 14, height: size === 'sm' ? 12 : size === 'lg' ? 18 : 14 } })
      }
      {children && <span>{children}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
