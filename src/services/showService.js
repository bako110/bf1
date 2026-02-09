import api from '../config/api';

export async function fetchShows(page = 1, limit = 20) {
  const res = await api.get(`/shows?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createShow(show) {
  const res = await api.post('/shows', show);
  return res.data;
}

export async function updateShow(id, show) {
  const res = await api.put(`/shows/${id}`, show);
  return res.data;
}

export async function deleteShow(id) {
  const res = await api.delete(`/shows/${id}`);
  return res.data;
}
