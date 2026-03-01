// services/uploadService.js
import api from '../config/api';

/**
 * Service générique pour l'upload d'images
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000 // 5 minutes
  });
  
  // Le backend retourne { success: true, message: "...", data: { url, public_id, ... } }
  if (res.data && res.data.data) {
    return {
      url: res.data.data.url,
      public_id: res.data.data.public_id,
      ...res.data.data
    };
  }
  
  return res.data;
}

/**
 * Service universel pour l'upload de fichiers
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000 // 5 minutes
  });
  
  if (res.data && res.data.data) {
    return {
      url: res.data.data.url,
      public_id: res.data.data.public_id,
      ...res.data.data
    };
  }
  
  return res.data;
}

/**
 * Service pour l'upload de vidéos - Version améliorée avec progression
 */
export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Configuration avec gestion de progression
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 minutes pour les vidéos
  };
  
  // Ajouter le callback de progression si fourni
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    };
  }
  
  try {
    const res = await api.post('/upload/video', formData, config);
    
    if (res.data && res.data.data) {
      return {
        url: res.data.data.url,
        public_id: res.data.data.public_id,
        ...res.data.data
      };
    }
    
    return res.data;
  } catch (error) {
    // Amélioration des messages d'erreur
    if (error.code === 'ECONNABORTED') {
      throw new Error('Le téléchargement a pris trop de temps. Veuillez réessayer avec un fichier plus petit.');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
}