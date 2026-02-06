import api from '../config/api';

export async function sendContactMessage(name, email, message, subject = null) {
  const res = await api.post('/contact', { name, email, message, subject });
  return res.data;
}

export async function getAboutInfo() {
  const res = await api.get('/contact/about');
  return res.data;
}

export async function fetchContactMessages(skip = 0, limit = 100) {
  const res = await api.get('/contact/messages', { params: { skip, limit } });
  return res.data;
}

export async function deleteContactMessage(id) {
  const res = await api.delete(`/contact/messages/${id}`);
  return res.data;
}
