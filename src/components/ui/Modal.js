import React, { useEffect } from 'react';
import Button from './Button';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const BORDER = '#E5E7EB';

const SIZE_W = { sm: 440, md: 520, lg: 680, xl: 900, '2xl': 1100, full: '95vw' };

export default function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, closeOnBackdrop = true }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Centrage */}
      <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative', background: '#fff', borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            width: '100%', maxWidth: SIZE_W[size] ?? 520,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            border: `1px solid ${BORDER}`,
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${BORDER}`,
              borderRadius: '14px 14px 0 0', background: '#FAFAFA',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 3, height: 20, background: RED, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: GRAY1, margin: 0 }}>{title}</h3>
              </div>
              {showCloseButton && (
                <Button variant="ghost" size="sm" onClick={onClose} icon="x" />
              )}
            </div>
          )}

          {/* Contenu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
