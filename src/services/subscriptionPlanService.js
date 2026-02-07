import api from '../config/api';

export async function fetchSubscriptionPlans() {
  const res = await api.get('/subscription-plans');
  return res.data;
}

export async function getSubscriptionPlanById(id) {
  const res = await api.get(`/subscription-plans/${id}`);
  return res.data;
}

export async function createSubscriptionPlan(plan) {
  const res = await api.post('/subscription-plans', plan);
  return res.data;
}

export async function updateSubscriptionPlan(id, plan) {
  const res = await api.put(`/subscription-plans/${id}`, plan);
  return res.data;
}

export async function deleteSubscriptionPlan(id) {
  const res = await api.delete(`/subscription-plans/${id}`);
  return res.data;
}
