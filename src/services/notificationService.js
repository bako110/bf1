import api from '../config/api';

export async function fetchPushNotifications(page = 1, limit = 20) {
  const res = await api.get(`/push-notifications?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createPushNotification(notification) {
  const res = await api.post('/push-notifications', notification);
  return res.data;
}

export async function updatePushNotification(id, notification) {
  const res = await api.patch(`/push-notifications/${id}`, notification);
  return res.data;
}

export async function deletePushNotification(id) {
  const res = await api.delete(`/push-notifications/${id}`);
  return res.data;
}

export async function sendPushNotification(notificationId) {
  const res = await api.post(`/push-notifications/${notificationId}/send`);
  return res.data;
}

export async function getPushNotificationStats() {
  const res = await api.get('/push-notifications/stats');
  return res.data;
}

// Fonctions pour le Header admin (compatibilité)
export async function fetchNotifications() {
  try {
    const res = await api.get('/notifications/me');
    return res.data;
  } catch (error) {
    console.error('Erreur chargement notifications:', error);
    return [];
  }
}

export async function markAsRead(id) {
  try {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.error('Erreur marquer comme lu:', error);
    throw error;
  }
}

export async function deleteNotification(id) {
  try {
    await api.delete(`/notifications/${id}`);
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    throw error;
  }
}

export async function getUnreadCount() {
  try {
    const res = await api.get('/notifications/unread/count');
    return res.data.count || 0;
  } catch (error) {
    console.error('Erreur comptage notifications non lues:', error);
    return 0;
  }
}
