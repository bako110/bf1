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
