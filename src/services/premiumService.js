import api from '../config/api';

export async function fetchPremiumContent() {
  const res = await api.get('/premium');
  return res.data;
}

export async function getPremiumOffer() {
  const res = await api.get('/premium/offer');
  return res.data;
}

export async function getUserPremiumStatus() {
  const res = await api.get('/premium/me');
  return res.data;
}

export async function togglePremium(contentId) {
  const res = await api.patch(`/premium/${contentId}/toggle`);
  return res.data;
}

export async function getPremiumStats() {
  const res = await api.get('/premium/stats');
  return res.data;
}
