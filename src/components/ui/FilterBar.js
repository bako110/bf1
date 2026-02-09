import React, { useState } from 'react';

export default function FilterBar({ 
  filters = [], 
  onFilterChange, 
  onSearch, 
  searchPlaceholder = "Rechercher...",
  showSearch = true,
  className = ""
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilter = (key) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    if (onFilterChange) {
      onFilterChange({});
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Barre de recherche */}
        {showSearch && (
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              {filter.type === 'select' ? (
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all bg-white"
                >
                  <option value="">{filter.placeholder}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                />
              ) : filter.type === 'text' ? (
                <input
                  type="text"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full">
              <span>Recherche: {searchTerm}</span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  if (onSearch) onSearch('');
                }}
                className="ml-1 hover:text-gray-300"
              >
                ×
              </button>
            </div>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const displayValue = filter?.options?.find(opt => opt.value === value)?.label || value;
            return (
              <div key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full">
                <span>{filter?.label || key}: {displayValue}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
