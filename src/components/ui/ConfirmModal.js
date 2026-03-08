import React from 'react';
import Button from './Button';

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
      icon: "🗑️",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    warning: {
      confirmBg: "bg-yellow-600 hover:bg-yellow-700", 
      confirmText: "text-white",
      icon: "⚠️",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    info: {
      confirmBg: "bg-blue-600 hover:bg-blue-700",
      confirmText: "text-white", 
      icon: "ℹ️",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 border border-gray-100">
        {/* Header moderne */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer avec boutons modernes */}
        <div className="px-8 pb-8">
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              className="px-6 py-3"
            >
              {cancelText}
            </Button>
            <Button
              variant={type === 'danger' ? 'danger' : type === 'warning' ? 'secondary' : 'primary'}
              onClick={onConfirm}
              className="px-6 py-3"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
