import api from '../config/api';

export async function fetchMovies() {
  const res = await api.get('/movies');
  return res.data;
}

export async function createMovie(movie) {
  const res = await api.post('/movies', movie);
  return res.data;
}

export async function updateMovie(id, movie) {
  const res = await api.put(`/movies/${id}`, movie);
  return res.data;
}

export async function deleteMovie(id) {
  const res = await api.delete(`/movies/${id}`);
  return res.data;
}
