import api from '../config/api';

export async function fetchBreakingNews(skip = 0, limit = 50) {
  const res = await api.get('/news');
  return res.data;
}

export async function createBreakingNews(news) {
  const res = await api.post('/news', news);
  return res.data;
}

export async function updateBreakingNews(id, news) {
  const res = await api.patch(`/news/${id}`, news);
  return res.data;
}

export async function deleteBreakingNews(id) {
  const res = await api.delete(`/news/${id}`);
  return res.data;
}

export async function getBreakingNewsById(id) {
  const res = await api.get(`/news/${id}`);
  return res.data;
}
