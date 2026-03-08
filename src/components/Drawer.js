import React, { useEffect } from 'react';
import Button from './ui/Button';

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  position = 'right'
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
    sm: 'w-full md:w-1/3',
    md: 'w-full md:w-1/2',
    lg: 'w-full md:w-2/3',
    xl: 'w-full md:w-3/4',
    full: 'w-full'
  };

  const positionClasses = {
    right: 'right-0',
    left: 'left-0'
  };

  const slideAnimation = {
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    left: isOpen ? 'translate-x-0' : '-translate-x-full'
  };

  return (
    <>
      {/* Overlay avec blur moderne */}
      <div 
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-40 
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Drawer moderne */}
      <div 
        className={`
          fixed top-0 h-full ${sizeClasses[size]} ${positionClasses[position]}
          bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-out
          ${slideAnimation[position]}
          border-l border-gray-200 backdrop-blur-lg
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header moderne avec gradient */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 mt-1" />
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              icon="x"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-3"
            />
          </div>

          {/* Content avec scroll moderne */}
          <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-white to-gray-50/30">
            <div className="max-w-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
