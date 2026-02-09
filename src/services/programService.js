import api from '../config/api';

export async function fetchPrograms(page = 1, limit = 20) {
  const res = await api.get(`/programs?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getProgramById(id) {
  const res = await api.get(`/programs/${id}`);
  return res.data;
}

export async function createProgram(program) {
  const res = await api.post('/programs', program);
  return res.data;
}

export async function updateProgram(id, program) {
  const res = await api.put(`/programs/${id}`, program);
  return res.data;
}

export async function deleteProgram(id) {
  const res = await api.delete(`/programs/${id}`);
  return res.data;
}
