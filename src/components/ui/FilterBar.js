import React, { useState } from 'react';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY3  = '#6B7280';
const BORDER = '#E5E7EB';

const inputCls = {
  width: '100%', padding: '8px 12px 8px 36px',
  fontSize: 13, color: GRAY1,
  border: `1px solid ${BORDER}`, borderRadius: 8,
  outline: 'none', background: '#fff',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const selectCls = {
  padding: '8px 12px', fontSize: 13, color: GRAY1,
  border: `1px solid ${BORDER}`, borderRadius: 8,
  outline: 'none', background: '#fff',
  transition: 'border-color 0.15s', cursor: 'pointer',
};

export default function FilterBar({
  filters = [], onFilterChange, onSearch,
  searchPlaceholder = 'Rechercher...', showSearch = true, className = '',
}) {
  const [searchTerm,    setSearchTerm]    = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (v) => { setSearchTerm(v); onSearch?.(v); };

  const handleFilter = (key, value) => {
    const next = { ...activeFilters, [key]: value };
    setActiveFilters(next); onFilterChange?.(next);
  };

  const clearFilter = (key) => {
    const next = { ...activeFilters }; delete next[key];
    setActiveFilters(next); onFilterChange?.(next);
  };

  const clearAll = () => {
    setActiveFilters({}); setSearchTerm('');
    onFilterChange?.({}); onSearch?.('');
  };

  const hasActive = Object.keys(activeFilters).length > 0 || searchTerm;

  const focusStyle  = (e) => { e.target.style.borderColor = RED; e.target.style.boxShadow = `0 0 0 2px rgba(226,62,62,0.15)`; };
  const blurStyle   = (e) => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{
      background: '#fff', border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: '14px 16px', marginBottom: 20,
    }} className={className}>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

        {/* Recherche */}
        {showSearch && (
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={inputCls}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        )}

        {/* Filtres */}
        {filters.map(filter => (
          <div key={filter.key}>
            {filter.type === 'select' ? (
              <select
                value={activeFilters[filter.key] || ''}
                onChange={e => handleFilter(filter.key, e.target.value)}
                style={selectCls}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">{filter.placeholder}</option>
                {filter.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type === 'date' ? 'date' : 'text'}
                value={activeFilters[filter.key] || ''}
                onChange={e => handleFilter(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                style={{ ...selectCls, minWidth: 140 }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            )}
          </div>
        ))}

        {/* Effacer tout */}
        {hasActive && (
          <button onClick={clearAll} style={{
            padding: '7px 12px', fontSize: 12, fontWeight: 600,
            color: GRAY3, background: '#F9FAFB',
            border: `1px solid ${BORDER}`, borderRadius: 7,
            cursor: 'pointer',
          }}>
            Effacer
          </button>
        )}
      </div>

      {/* Badges filtres actifs */}
      {hasActive && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {searchTerm && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 20,
              background: `rgba(226,62,62,0.08)`,
              color: RED, fontSize: 12, fontWeight: 600,
              border: `1px solid rgba(226,62,62,0.20)`,
            }}>
              Recherche : {searchTerm}
              <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, lineHeight: 1, padding: 0, fontSize: 14 }}>×</button>
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const label  = filter?.options?.find(o => o.value === value)?.label || value;
            return (
              <span key={key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20,
                background: `rgba(226,62,62,0.08)`,
                color: RED, fontSize: 12, fontWeight: 600,
                border: `1px solid rgba(226,62,62,0.20)`,
              }}>
                {filter?.label || key} : {label}
                <button onClick={() => clearFilter(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, lineHeight: 1, padding: 0, fontSize: 14 }}>×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
