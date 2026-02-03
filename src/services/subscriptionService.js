import api from '../config/api';

export async function fetchSubscriptions() {
  const res = await api.get('/subscriptions');
  return res.data;
}

export async function cancelSubscription(id) {
  const res = await api.patch(`/subscriptions/${id}/cancel`);
  return res.data;
}
