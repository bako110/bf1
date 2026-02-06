import api from '../config/api';

export async function fetchReplays(skip = 0, limit = 50) {
  const res = await api.get('/replays');
  return res.data;
}

export async function createReplay(replay) {
  const res = await api.post('/replays', replay);
  return res.data;
}

export async function updateReplay(id, replay) {
  const res = await api.patch(`/replays/${id}`, replay);
  return res.data;
}

export async function deleteReplay(id) {
  const res = await api.delete(`/replays/${id}`);
  return res.data;
}

export async function getReplayById(id) {
  const res = await api.get(`/replays/${id}`);
  return res.data;
}
