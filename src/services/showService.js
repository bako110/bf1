import api from '../config/api';

export async function fetchShows() {
  const res = await api.get('/shows');
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
