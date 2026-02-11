import api from '../config/api';

/**
 * Service générique pour l'upload d'images
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
 * Service pour l'upload de vidéos
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
