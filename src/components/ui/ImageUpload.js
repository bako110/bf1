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

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}

      {uploading && (
        <div className="text-sm text-blue-600 mt-2 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Upload en cours...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 mt-2">{error}</div>
      )}

      {value && !uploading && (
        <div className="mt-3">
          <img
            src={value}
            alt="Aperçu"
            className="h-32 w-auto object-cover border border-gray-300 rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
