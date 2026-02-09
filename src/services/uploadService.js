import api from '../config/api';

/**
 * Service générique pour l'upload d'images
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return res.data;
}

/**
 * Service universel pour l'upload de fichiers
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/uploads/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return res.data;
}

/**
 * Service pour l'upload de vidéos
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('video', file);
  
  const res = await api.post('/uploads/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return res.data;
}
