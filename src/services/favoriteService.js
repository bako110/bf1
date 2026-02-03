import api from '../config/api';

export async function fetchFavorites() {
  const res = await api.get('/favorites');
  return res.data;
}

export async function deleteFavorite(id) {
  const res = await api.delete(`/favorites/${id}`);
  return res.data;
}
