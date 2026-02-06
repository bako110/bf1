import api from '../config/api';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteUpload(id) {
  const res = await api.delete(`/uploads/${id}`);
  return res.data;
}

export async function getUploadHistory(skip = 0, limit = 50) {
  const res = await api.get('/uploads/history', { params: { skip, limit } });
  return res.data;
}
