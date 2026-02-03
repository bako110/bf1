import api from '../config/api';

export async function fetchNews() {
  const res = await api.get('/news');
  return res.data;
}

export async function createNews(news) {
  const res = await api.post('/news', news);
  return res.data;
}

export async function updateNews(id, news) {
  const res = await api.put(`/news/${id}`, news);
  return res.data;
}

export async function deleteNews(id) {
  const res = await api.delete(`/news/${id}`);
  return res.data;
}
