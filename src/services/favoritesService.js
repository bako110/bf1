import api from '../config/api';

export async function fetchFavorites(skip = 0, limit = 1000) {
  const res = await api.get('/favorites', { params: { skip, limit } });
  return res.data;
}

export async function getMyFavorites() {
  const res = await api.get('/favorites/me');
  return res.data;
}

export async function getUserFavorites(userId) {
  const res = await api.get(`/favorites/user/${userId}`);
  return res.data;
}

export async function addFavorite(contentId, contentType) {
  const res = await api.post('/favorites', { content_id: contentId, content_type: contentType });
  return res.data;
}

export async function removeFavorite(id) {
  const res = await api.delete(`/favorites/${id}`);
  return res.data;
}

export async function getFavoriteById(id) {
  const res = await api.get(`/favorites/${id}`);
  return res.data;
}
