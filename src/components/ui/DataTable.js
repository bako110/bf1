import React from 'react';
import DropdownActions from './DropdownActions';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY2  = '#374151';
const GRAY3  = '#6B7280';
const BORDER = '#E5E7EB';

export default function DataTable({ columns = [], data = [], actions = [], onRowClick, selectable = false, selectedIds = [], onSelectionChange }) {
  const getRowId = (row) => row.id || row._id;

  const toggleSelect = (id) => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedIds.length === data.length ? [] : data.map(r => getRowId(r)));
  };

  const handleRowClick = (row, e) => {
    if (e.target.closest('button') || e.target.closest('[role="button"]') || e.target.closest('input[type="checkbox"]')) return;
    onRowClick?.(row);
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${BORDER}`, background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: `1px solid ${BORDER}` }}>
            {selectable && (
              <th style={{ padding: '12px 16px', width: 40 }}>
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  style={{ accentColor: RED, width: 15, height: 15, cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '12px 16px', textAlign: 'left',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                color: GRAY3, textTransform: 'uppercase',
              }}>
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th style={{ padding: '12px 16px', width: 48 }} />
            )}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => {
              const rowId     = getRowId(row);
              const isSelected = selectable && selectedIds.includes(rowId);
              return (
                <tr
                  key={rowId || idx}
                  onClick={e => handleRowClick(row, e)}
                  style={{
                    borderBottom: `1px solid ${BORDER}`,
                    background: isSelected ? 'rgba(226,62,62,0.04)' : '#fff',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(226,62,62,0.04)' : '#fff'; }}
                >
                  {selectable && (
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(rowId)}
                        style={{ accentColor: RED, width: 15, height: 15, cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '12px 16px', color: GRAY2 }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td style={{ padding: '12px 16px' }}>
                      <DropdownActions items={actions} onAction={action => action.onClick?.(row)} />
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}
                style={{ padding: '32px 16px', textAlign: 'center', color: GRAY3 }}
              >
                Aucune donnée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
