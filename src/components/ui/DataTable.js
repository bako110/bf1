import React from 'react';
import DropdownActions from './DropdownActions';

export default function DataTable({ columns = [], data = [], actions = [] }) {
  const handleAction = (action, row) => {
    if (action.onClick) {
      action.onClick(row);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
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
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4">
                  <DropdownActions 
                    items={actions.map(action => ({
                      ...action,
                      action: action
                    }))}
                    onAction={(action) => handleAction(action, row)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
