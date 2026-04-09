import api from '../config/api';

export async function fetchBreakingNews(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const res = await api.get(`/news?skip=${skip}&limit=${limit}`);
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

export async function deleteBatchBreakingNews(ids) {
  const res = await api.post('/news/delete-batch', { ids });
  return res.data;
}

export async function getBreakingNewsById(id) {
  const res = await api.get(`/news/${id}`);
  return res.data;
}
