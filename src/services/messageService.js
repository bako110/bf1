import api from '../config/api';

export const fetchMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const fetchInbox = async () => {
  const response = await api.get('/messages/inbox');
  return response.data;
};

export const fetchSentMessages = async () => {
  const response = await api.get('/messages/sent');
  return response.data;
};

export const fetchConversation = async (otherUserId) => {
  const response = await api.get(`/messages/conversation/${otherUserId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const markAsRead = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

export const countUnreadMessages = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};
