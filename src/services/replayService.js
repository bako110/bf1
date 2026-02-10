import api from '../config/api';

export async function fetchReplays(page = 1, limit = 20) {
  const res = await api.get(`/replays?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createReplay(replay) {
  const res = await api.post('/replays', replay, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export async function updateReplay(id, replay) {
  const res = await api.patch(`/replays/${id}`, replay, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
