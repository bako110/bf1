import React from 'react';
import Button from './Button';

export default function DetailView({ 
  data, 
  fields, 
  title, 
  onClose, 
  onEdit,
  onDelete,
  actions = [],
  customSections = []
}) {
  if (!data) return null;

  const renderField = (field, value) => {
    if (!value && value !== 0) return null;

    switch (field.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <img 
              src={value} 
              alt={field.label}
              className="w-32 h-48 object-cover rounded-lg border border-gray-200"
              onError={(e) => e.target.src = 'https://via.placeholder.com/128x192/e5e7eb/6b7280?text=Image'}
            />
          </div>
        );

      case 'banner':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <img 
              src={value} 
              alt={field.label}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => e.target.src = 'https://via.placeholder.com/400x128/e5e7eb/6b7280?text=Banner'}
            />
          </div>
        );

      case 'badges':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(value) ? value.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  {item}
                </span>
              )) : (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  {value}
                </span>
              )}
            </div>
          </div>
        );

      case 'status':
        const statusColors = {
          ongoing: 'bg-green-100 text-green-800',
          completed: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-red-100 text-red-800',
          hiatus: 'bg-yellow-100 text-yellow-800',
          upcoming: 'bg-gray-100 text-gray-800'
        };
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <span className={`inline-flex px-3 py-1 text-sm rounded-full ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
              {field.options?.[value] || value}
            </span>
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {value ? 'Oui' : 'Non'}
            </span>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <p className="text-gray-900">
              {new Date(value).toLocaleDateString('fr-FR')}
            </p>
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <p className="text-gray-900">
              {Math.floor(value / 60)}h {value % 60}min
            </p>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {value}
            </p>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline break-all"
            >
              {value}
            </a>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <p className="text-gray-900">{value}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header avec actions */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Détails complets et informations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'secondary'}
              size="sm"
              onClick={action.onClick}
              icon={action.icon}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}
          
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              icon="edit"
            >
              Modifier
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              icon="trash-2"
            >
              Supprimer
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon="x"
          >
            Fermer
          </Button>
        </div>
      </div>

      {/* Sections personnalisées */}
      {customSections.map((section, idx) => (
        <div key={idx} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            {section.icon && <span className="text-2xl">{section.icon}</span>}
            <span>{section.title}</span>
          </h2>
          <div className="bg-gray-50 rounded-xl p-6">
            {section.content}
          </div>
        </div>
      ))}

      {/* Grille des champs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fields.map((field, idx) => (
          <div key={idx}>
            {renderField(field, data[field.key])}
          </div>
        ))}
      </div>
    </div>
  );
}