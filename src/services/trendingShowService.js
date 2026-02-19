import api from '../config/api';

export async function fetchJTandMag(page = 1, limit = 20) {
  const res = await api.get(`/jtandmag?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createJTandMag(data) {
  const res = await api.post('/jtandmag', data);
  return res.data;
}

export async function updateJTandMag(id, data) {
  const res = await api.put(`/jtandmag/${id}`, data);
  return res.data;
}

export async function deleteJTandMag(id) {
  const res = await api.delete(`/jtandmag/${id}`);
  return res.data;
}

export async function getJTandMagById(id) {
  const res = await api.get(`/jtandmag/${id}`);
  return res.data;
}
