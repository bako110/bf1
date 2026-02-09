import api from '../config/api';

export async function fetchReels(page = 1, limit = 20) {
  const res = await api.get(`/reels?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createReel(reel) {
  // Déterminer si c'est FormData (fichier) ou JSON (URL)
  const isFormData = reel instanceof FormData;
  
  const config = isFormData ? {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } : {};
  
  const res = await api.post('/reels', reel, config);
  return res.data;
}

export async function updateReel(id, reel) {
  // Déterminer si c'est FormData (fichier) ou JSON (URL)
  const isFormData = reel instanceof FormData;
  
  const config = isFormData ? {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } : {};
  
  const res = await api.patch(`/reels/${id}`, reel, config);
  return res.data;
}

export async function deleteReel(id) {
  const res = await api.delete(`/reels/${id}`);
  return res.data;
}

export async function getReelById(id) {
  const res = await api.get(`/reels/${id}`);
  return res.data;
}
