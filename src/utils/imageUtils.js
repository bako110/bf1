const API_BASE = (process.env.REACT_APP_API_URL || 'http://161.97.117.46:8090/api/v1')
  .replace('/api/v1', '');

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
