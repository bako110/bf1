import api from '../config/api';

export async function fetchSubscriptions() {
  const res = await api.get('/subscriptions');
  return res.data;
}

export async function fetchSubscriptionPlans(active_only = false) {
  const res = await api.get('/subscription-plans', { params: { active_only } });
  return res.data;
}

export async function createSubscriptionPlan(plan) {
  const res = await api.post('/subscription-plans', plan);
  return res.data;
}

export async function updateSubscriptionPlan(id, plan) {
  const res = await api.patch(`/subscription-plans/${id}`, plan);
  return res.data;
}

export async function deleteSubscriptionPlan(id) {
  const res = await api.delete(`/subscription-plans/${id}`);
  return res.data;
}

export async function cancelSubscription(id) {
  const res = await api.patch(`/subscriptions/${id}/cancel`);
  return res.data;
}
