import api from '../config/api';

export async function fetchLikes() {
  const res = await api.get('/likes');
  return res.data;
}

export async function deleteLike(id) {
  const res = await api.delete(`/likes/${id}`);
  return res.data;
}
