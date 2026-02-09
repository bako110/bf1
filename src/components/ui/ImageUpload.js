import React, { useState } from 'react';
import { uploadImage } from '../../services/uploadService';

export default function ImageUpload({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  helperText = null 
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function handleFileSelect(file) {
    if (!file) return;

    // Vérifier si c'est bien une image
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image (JPG, PNG, GIF, WebP).');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError("Erreur lors de l'upload de l'image.");
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            <svg 
              className={`w-12 h-12 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div className="space-y-1">
            <p className={`text-sm ${dragOver ? 'text-blue-600' : 'text-gray-600'}`}>
              <span className="font-semibold">Cliquez pour sélectionner</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, GIF, WebP (MAX. 5MB)
            </p>
          </div>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-gray-500 mt-2">{helperText}</p>
      )}

      {uploading && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Upload en cours...
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {value && !uploading && (
        <div className="mt-3">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Aperçu"
              className="h-32 w-auto object-cover border border-gray-300 rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2">✅ Image uploadée avec succès</p>
        </div>
      )}
    </div>
  );
}
