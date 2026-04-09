import api from '../config/api';

export async function fetchTeleRealite(page = 1, limit = 20, subType = null) {
  const params = { skip: (page - 1) * limit, limit };
  if (subType) params.sub_type = subType;
  const response = await api.get('/tele-realite', { params });
  return response.data;
}

export async function createTeleRealite(data) {
  const response = await api.post('/tele-realite', data);
  return response.data;
}

export async function updateTeleRealite(id, data) {
  const response = await api.patch(`/tele-realite/${id}`, data);
  return response.data;
}

export async function deleteTeleRealite(id) {
  const response = await api.delete(`/tele-realite/${id}`);
  return response.data;
}

export async function deleteBatchTeleRealite(ids) {
  const res = await api.post('/tele-realite/delete-batch', { ids });
  return res.data;
}
