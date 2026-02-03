import api from '../config/api';

export async function loginAdmin(identifier, password) {
  const res = await api.post('/users/login', { identifier, password });
  // Stocker le token si reçu
  if (res.data && res.data.access_token) {
    localStorage.setItem('admin_token', res.data.access_token);
  }
  return res.data;
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token');
}
