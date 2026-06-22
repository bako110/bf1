import React from 'react';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY3  = '#6B7280';
const GRAY4  = '#9CA3AF';
const BORDER = '#E5E7EB';

function ChevronLeft() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  loading = false,
  itemsPerPage = 20,
  totalItems,
}) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end   = Math.min(totalPages, start + maxVisible - 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const from = ((currentPage - 1) * itemsPerPage) + 1;
  const to   = Math.min(currentPage * itemsPerPage, totalItems ?? 0);

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, height: 34, padding: '0 12px',
    fontSize: 13, fontWeight: 500,
    border: `1px solid ${BORDER}`,
    borderRadius: 7, cursor: 'pointer',
    transition: 'all 0.15s', background: '#fff',
    outline: 'none',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '20px 0 8px',
    }}>

      {/* Compteur */}
      {totalItems > 0 && (
        <p style={{ fontSize: 12, color: GRAY3, margin: 0 }}>
          <span style={{ fontWeight: 600, color: GRAY1 }}>{from}–{to}</span>
          {' '}sur{' '}
          <span style={{ fontWeight: 600, color: GRAY1 }}>{totalItems}</span>
          {' '}éléments
        </p>
      )}

      {/* Contrôles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

        {/* Précédent */}
        <button
          onClick={() => hasPrevPage && !loading && onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          style={{
            ...btnBase,
            color: hasPrevPage && !loading ? GRAY1 : GRAY4,
            background: hasPrevPage && !loading ? '#fff' : '#F9FAFB',
            borderColor: hasPrevPage && !loading ? BORDER : '#F3F4F6',
            cursor: hasPrevPage && !loading ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (hasPrevPage && !loading) { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = hasPrevPage ? GRAY1 : GRAY4; }}
        >
          <ChevronLeft />
          <span>Précédent</span>
        </button>

        {/* Numéros */}
        {getVisiblePages().map(page => {
          const active = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => !loading && onPageChange(page)}
              disabled={loading}
              style={{
                ...btnBase,
                width: 34, padding: 0,
                fontWeight: active ? 700 : 500,
                background: active ? RED : '#fff',
                color:      active ? '#fff' : GRAY1,
                borderColor: active ? RED : BORDER,
                boxShadow: active ? `0 2px 8px rgba(226,62,62,0.30)` : 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!active && !loading) { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GRAY1; } }}
            >
              {page}
            </button>
          );
        })}

        {/* Suivant */}
        <button
          onClick={() => hasNextPage && !loading && onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          style={{
            ...btnBase,
            color: hasNextPage && !loading ? GRAY1 : GRAY4,
            background: hasNextPage && !loading ? '#fff' : '#F9FAFB',
            borderColor: hasNextPage && !loading ? BORDER : '#F3F4F6',
            cursor: hasNextPage && !loading ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (hasNextPage && !loading) { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = hasNextPage ? GRAY1 : GRAY4; }}
        >
          <span>Suivant</span>
          <ChevronRight />
        </button>
      </div>

      {/* Spinner chargement */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: GRAY3 }}>
          <div style={{
            width: 14, height: 14,
            border: `2px solid ${BORDER}`,
            borderTopColor: RED,
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span>Chargement...</span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
