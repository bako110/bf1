import React, { useEffect } from 'react';
import Button from './Button';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true 
}) {
  // Gestion de l'échappement
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop avec animation */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal avec animations modernes */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} 
            max-h-[90vh] flex flex-col transform transition-all duration-300
            border border-gray-100
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header moderne avec gradient subtil */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h3>
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon="x"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                />
              )}
            </div>
          )}
          
          {/* Content avec padding moderne */}
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}