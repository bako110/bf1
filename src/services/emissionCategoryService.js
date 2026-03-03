import api from '../config/api';

export async function fetchEmissionCategories() {
  const response = await api.get('/emission-categories');
  return response.data;
}

export async function createEmissionCategory(data) {
  const response = await api.post('/emission-categories', data);
  return response.data;
}

export async function updateEmissionCategory(id, data) {
  const response = await api.put(`/emission-categories/${id}`, data);
  return response.data;
}

export async function deleteEmissionCategory(id) {
  const response = await api.delete(`/emission-categories/${id}`);
  return response.data;
}
