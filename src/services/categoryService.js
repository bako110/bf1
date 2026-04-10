import api from '../config/api';

const SECTIONS = [
  { key: 'flash_infos',    label: 'Flash Infos' },
  { key: 'jtandmag',       label: 'Journal' },
  { key: 'magazine',       label: 'Magazine' },
  { key: 'reportage',      label: 'Reportages' },
  { key: 'divertissement', label: 'Divertissement et Mag' },
  { key: 'sport',          label: 'Sport' },
  { key: 'tele_realite',   label: 'Télé Réalité et Événements' },
  { key: 'missed',         label: 'Contenus Manqués' },
  { key: 'archive',        label: 'Archives' },
];

export { SECTIONS };

export async function fetchCategories(section = null, activeOnly = false) {
  const params = {};
  if (section) params.section = section;
  if (activeOnly) params.active_only = true;
  const response = await api.get('/section-categories', { params });
  return response.data;
}

export async function createCategory(data) {
  const response = await api.post('/section-categories', data);
  return response.data;
}

export async function updateCategory(id, data) {
  const response = await api.patch(`/section-categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/section-categories/${id}`);
  return response.data;
}
