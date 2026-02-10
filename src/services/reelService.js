import api from '../config/api';

export async function fetchReels(page = 1, limit = 20) {
  const res = await api.get(`/reels?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createReel(reel) {
  const res = await api.post('/reels', reel, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export async function updateReel(id, reel) {
  const res = await api.patch(`/reels/${id}`, reel, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
