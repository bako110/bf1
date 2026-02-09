import React from 'react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  type = "danger" // danger, warning, info
}) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      confirmBg: "bg-red-600 hover:bg-red-700",
      confirmText: "text-white",
      icon: "⚠️"
    },
    warning: {
      confirmBg: "bg-yellow-600 hover:bg-yellow-700", 
      confirmText: "text-white",
      icon: "⚠️"
    },
    info: {
      confirmBg: "bg-blue-600 hover:bg-blue-700",
      confirmText: "text-white", 
      icon: "ℹ️"
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{styles.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.confirmBg} ${styles.confirmText}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
