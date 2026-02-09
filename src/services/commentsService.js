import api from '../config/api';

export async function fetchComments(page = 1, limit = 20) {
  const res = await api.get(`/comments?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getCommentsByContent(contentId, contentType, skip = 0, limit = 50) {
  const res = await api.get(`/comments/content/${contentType}/${contentId}`, { params: { skip, limit } });
  return res.data;
}

export async function createComment(contentId, contentType, text) {
  const res = await api.post('/comments', { content_id: contentId, content_type: contentType, text });
  return res.data;
}

export async function updateComment(id, text) {
  const res = await api.put(`/comments/${id}`, { text });
  return res.data;
}

export async function deleteComment(id) {
  const res = await api.delete(`/comments/${id}`);
  return res.data;
}

export async function moderateComment(id, action) {
  const res = await api.patch(`/comments/${id}/moderate`, { action });
  return res.data;
}
