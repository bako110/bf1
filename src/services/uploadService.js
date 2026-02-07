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
