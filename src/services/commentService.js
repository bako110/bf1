import api from '../config/api';

export async function fetchComments() {
  const res = await api.get('/comments');
  return res.data;
}

export async function deleteComment(id) {
  const res = await api.delete(`/comments/${id}`);
  return res.data;
}
