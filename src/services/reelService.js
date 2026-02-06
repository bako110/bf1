import api from '../config/api';

export async function fetchReels(skip = 0, limit = 50) {
  const res = await api.get('/reels');
  return res.data;
}

export async function createReel(reel) {
  const res = await api.post('/reels', reel);
  return res.data;
}

export async function updateReel(id, reel) {
  const res = await api.patch(`/reels/${id}`, reel);
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
