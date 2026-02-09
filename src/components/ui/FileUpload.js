import React, { useState } from 'react';
import { uploadFile } from '../../services/uploadService';

export default function FileUpload({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  helperText = null,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB par défaut
  multiple = false,
  showPreview = true
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function handleFileSelect(file) {
    if (!file) return;

    // Vérification du type de fichier
    if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
      setError(`Veuillez sélectionner un fichier valide (${accept}).`);
      return;
    }

    // Vérification de la taille
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setError(`Le fichier ne doit pas dépasser ${maxSizeMB}MB.`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await uploadFile(file);
      if (multiple) {
        onChange([...(value || []), result]);
      } else {
        onChange(result);
      }
    } catch (err) {
      setError("Erreur lors de l'upload du fichier.");
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files || []);
    if (multiple) {
      files.forEach(file => handleFileSelect(file));
    } else if (files.length > 0) {
      handleFileSelect(files[0]);
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
    
    const files = Array.from(e.dataTransfer.files);
    if (multiple) {
      files.forEach(file => handleFileSelect(file));
    } else if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }

  function removeFile(index) {
    if (multiple) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  }

  function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getAcceptText() {
    if (accept === '*/*') return 'Tous les fichiers';
    if (accept === 'image/*') return 'JPG, PNG, GIF, WebP';
    if (accept === 'video/*') return 'MP4, WebM, OGG, MOV';
    if (accept === 'audio/*') return 'MP3, WAV, OGG';
    return accept;
  }

  function getMaxSizeText() {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `MAX. ${maxSizeMB}MB`;
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
          accept={accept}
          multiple={multiple}
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
              {getAcceptText()} ({getMaxSizeText()})
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
        <div className="mt-3 space-y-2">
          {multiple ? (
            // Affichage multiple
            value.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  disabled={disabled}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            // Affichage unique
            <div className="relative inline-block">
              {showPreview && value.type?.startsWith('image/') ? (
                <img
                  src={value.url || URL.createObjectURL(value)}
                  alt="Aperçu"
                  className="h-32 w-auto object-cover border border-gray-300 rounded-lg shadow-sm"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-2xl">{getFileIcon(value.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{value.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(value.size)}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(0)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <p className="text-xs text-green-600 mt-2">✅ Fichier uploadé avec succès</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
