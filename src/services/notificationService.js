import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications/me`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const deleteNotification = async (id) => {
  await axios.delete(`${API_URL}/notifications/${id}`, {
    headers: getAuthHeaders()
  });
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/notifications/unread/count`, {
    headers: getAuthHeaders()
  });
  return response.data.count;
};
