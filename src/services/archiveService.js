import api from '../config/api';

export async function fetchArchives(page = 1, limit = 20) {
  const res = await api.get(`/archives?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createArchive(archive) {
  const res = await api.post('/archives', archive);
  return res.data;
}

export async function updateArchive(id, archive) {
  const res = await api.patch(`/archives/${id}`, archive);
  return res.data;
}

export async function deleteArchive(id) {
  const res = await api.delete(`/archives/${id}`);
  return res.data;
}

export async function getArchiveById(id) {
  const res = await api.get(`/archives/${id}`);
  return res.data;
}

export async function getArchiveCategories() {
  const res = await api.get('/archives/categories/list');
  return res.data;
}

export async function getArchiveStats() {
  const res = await api.get('/archives/stats/overview');
  return res.data;
}
