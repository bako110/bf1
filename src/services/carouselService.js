import api from '../config/api';

/** Liste publique (actives uniquement) */
export async function getCarouselPublic() {
  const res = await api.get('/carousel');
  return res.data;
}

/** Liste complète pour l'admin (actives + inactives) */
export async function getCarouselAdmin() {
  const res = await api.get('/carousel/admin/all');
  return res.data;
}

/** Créer une slide (JSON : title, description, image_url, order, is_active) */
export async function createCarouselItem(data) {
  const res = await api.post('/carousel', data);
  return res.data;
}

/** Modifier les métadonnées d'une slide */
export async function updateCarouselItem(id, data) {
  const res = await api.put(`/carousel/${id}`, data);
  return res.data;
}

/** Remplacer l'image d'une slide (JSON : image_url) */
export async function updateCarouselImage(id, imageUrl) {
  const res = await api.patch(`/carousel/${id}/image`, { image_url: imageUrl });
  return res.data;
}

/** Supprimer une slide */
export async function deleteCarouselItem(id) {
  const res = await api.delete(`/carousel/${id}`);
  return res.data;
}

/** Supprimer plusieurs slides en lot */
export async function deleteBatchCarousel(ids) {
  const res = await api.post('/carousel/delete-batch', { ids });
  return res.data;
}
