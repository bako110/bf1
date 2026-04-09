import React from 'react';
import DropdownActions from './DropdownActions';

export default function DataTable({ columns = [], data = [], actions = [], onRowClick, selectable = false, selectedIds = [], onSelectionChange }) {
  const handleAction = (action, row) => {
    if (action.onClick) {
      action.onClick(row);
    }
  };

  const handleRowClick = (row, e) => {
    if (e.target.closest('button') || e.target.closest('[role="button"]') || e.target.closest('input[type="checkbox"]')) {
      return;
    }
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const getRowId = (row) => row.id || row._id;

  const toggleSelect = (id) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]
    );
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(r => getRowId(r)));
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 font-semibold text-gray-900">
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-4 font-semibold text-gray-900 w-12">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => {
              const rowId = getRowId(row);
              const isSelected = selectable && selectedIds.includes(rowId);
              return (
                <tr 
                  key={rowId || idx} 
                  onClick={(e) => handleRowClick(row, e)}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(rowId)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-gray-700">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <DropdownActions 
                        items={actions}
                        onAction={(action) => handleAction(action, row)}
                      />
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                Aucune donnée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
