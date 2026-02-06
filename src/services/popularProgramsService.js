import api from '../config/api';

export async function fetchPopularPrograms(skip = 0, limit = 50) {
  const res = await api.get('/popular-programs');
  return res.data;
}

export async function createPopularProgram(program) {
  const res = await api.post('/popular-programs', program);
  return res.data;
}

export async function updatePopularProgram(id, program) {
  const res = await api.patch(`/popular-programs/${id}`, program);
  return res.data;
}

export async function deletePopularProgram(id) {
  const res = await api.delete(`/popular-programs/${id}`);
  return res.data;
}

export async function getPopularProgramById(id) {
  const res = await api.get(`/popular-programs/${id}`);
  return res.data;
}
