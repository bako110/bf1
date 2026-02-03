import api from '../config/api';

export async function fetchUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function createUser(user) {
  const res = await api.post('/users/register', user);
  return res.data;
}

export async function updateUser(id, user) {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get('/users/me');
  return res.data;
}
