import api from '../config/api';

export async function processPayment(amount, method, offer = null) {
  const res = await api.post('/payments/process', { amount, method, offer });
  return res.data;
}

export async function getPaymentMethods() {
  const res = await api.get('/payments/methods');
  return res.data;
}

export async function getPaymentHistory(skip = 0, limit = 50) {
  const res = await api.get('/payments/history', { params: { skip, limit } });
  return res.data;
}

export async function verifyPayment(transactionId) {
  const res = await api.get(`/payments/verify/${transactionId}`);
  return res.data;
}

// ==================== ADMIN FUNCTIONS ====================

export async function fetchAllPaymentMethods(skip = 0, limit = 50) {
  const res = await api.get('/payments/admin/methods', { params: { skip, limit } });
  return res.data;
}

export async function createPaymentMethod(data) {
  const res = await api.post('/payments/admin/methods', data);
  return res.data;
}

export async function updatePaymentMethod(methodId, data) {
  const res = await api.put(`/payments/admin/methods/${methodId}`, data);
  return res.data;
}

export async function deletePaymentMethod(methodId) {
  const res = await api.delete(`/payments/admin/methods/${methodId}`);
  return res.data;
}

export async function togglePaymentMethod(methodId) {
  const res = await api.patch(`/payments/admin/methods/${methodId}/toggle`);
  return res.data;
}
