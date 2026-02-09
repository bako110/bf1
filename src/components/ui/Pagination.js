import React from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNextPage, 
  hasPrevPage,
  loading = false,
  itemsPerPage = 20,
  totalItems
}) {
  const handlePrev = () => {
    if (hasPrevPage && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Calculer les pages à afficher
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      {/* Informations */}
      <div className="text-sm text-gray-600">
        {totalItems && (
          <span>
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} éléments
          </span>
        )}
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center space-x-2">
        {/* Bouton précédent */}
        <button
          onClick={handlePrev}
          disabled={!hasPrevPage || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasPrevPage && !loading
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>

        {/* Numéros de page */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Bouton suivant */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasNextPage && !loading
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Suivant
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <span>Chargement...</span>
        </div>
      )}
    </div>
  );
}
