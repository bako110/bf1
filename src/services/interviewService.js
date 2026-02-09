import api from '../config/api';

export async function fetchInterviews(page = 1, limit = 20) {
  const res = await api.get(`/interviews?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createInterview(interview) {
  const res = await api.post('/interviews', interview);
  return res.data;
}

export async function updateInterview(id, interview) {
  const res = await api.patch(`/interviews/${id}`, interview);
  return res.data;
}

export async function deleteInterview(id) {
  const res = await api.delete(`/interviews/${id}`);
  return res.data;
}

export async function getInterviewById(id) {
  const res = await api.get(`/interviews/${id}`);
  return res.data;
}
