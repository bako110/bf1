import api from '../config/api';

export async function fetchTrendingShows(skip = 0, limit = 50) {
  const res = await api.get('/trending-shows');
  return res.data;
}

export async function createTrendingShow(show) {
  const res = await api.post('/trending-shows', show);
  return res.data;
}

export async function updateTrendingShow(id, show) {
  const res = await api.patch(`/trending-shows/${id}`, show);
  return res.data;
}

export async function deleteTrendingShow(id) {
  const res = await api.delete(`/trending-shows/${id}`);
  return res.data;
}

export async function getTrendingShowById(id) {
  const res = await api.get(`/trending-shows/${id}`);
  return res.data;
}
