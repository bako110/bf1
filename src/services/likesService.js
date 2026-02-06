import api from '../config/api';

export async function fetchLikes(skip = 0, limit = 1000) {
  const res = await api.get('/likes', { params: { skip, limit } });
  return res.data;
}

export async function getLikesByContent(contentId, contentType, skip = 0, limit = 100) {
  const res = await api.get(`/likes/content/${contentType}/${contentId}`, { params: { skip, limit } });
  return res.data;
}

export async function toggleLike(contentId, contentType) {
  const res = await api.post('/likes/toggle', { content_id: contentId, content_type: contentType });
  return res.data;
}

export async function removeLike(id) {
  const res = await api.delete(`/likes/${id}`);
  return res.data;
}

export async function countLikes(contentId, contentType) {
  const res = await api.get(`/likes/content/${contentType}/${contentId}/count`);
  return res.data;
}

export async function checkUserLiked(contentId, contentType) {
  const res = await api.get(`/likes/check/${contentType}/${contentId}`);
  return res.data;
}
