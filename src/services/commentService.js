import api from '../config/api';

export async function fetchComments() {
  const res = await api.get('/comments');
  return res.data;
}

export async function moderateComment(id, is_hidden) {
  const res = await api.patch(`/comments/${id}/moderate`, { is_hidden });
  return res.data;
}

export async function adminUpdateComment(id, text) {
  const res = await api.patch(`/comments/${id}/admin`, { text });
  return res.data;
}

export async function deleteComment(id) {
  const res = await api.delete(`/comments/${id}`);
  return res.data;
}
