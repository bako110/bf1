import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

// Récupérer tous les Magazines
export const fetchMagazine = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const response = await axios.get(`${API_BASE_URL}/magazine?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des Magazines:', error);
    throw error;
  }
};

// Récupérer un Magazine par ID
export const getMagazineById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/magazine/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du Magazine:', error);
    throw error;
  }
};

// Créer un nouveau Magazine
export const createMagazine = async (magazineData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_BASE_URL}/magazine`, magazineData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du Magazine:', error);
    throw error;
  }
};

// Mettre à jour un Magazine
export const updateMagazine = async (id, magazineData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_BASE_URL}/magazine/${id}`, magazineData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Magazine:', error);
    throw error;
  }
};

// Supprimer un Magazine
export const deleteMagazine = async (id) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_BASE_URL}/magazine/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du Magazine:', error);
    throw error;
  }
};

export const deleteBatchMagazine = async (ids) => {
  const token = localStorage.getItem('admin_token');
  const response = await axios.post(`${API_BASE_URL}/magazine/delete-batch`, { ids }, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

// Récupérer les Magazines en vedette
export const getFeaturedMagazine = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/magazine/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des Magazines featured:', error);
    throw error;
  }
};

// Rechercher des Magazines
export const searchMagazine = async (query, limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/magazine/search?query=${query}&limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de Magazines:', error);
    throw error;
  }
};

// Incrémenter les vues d'un Magazine
export const incrementMagazineViews = async (id, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/magazine/${id}/views`, options);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};

// Gérer les likes d'un Magazine
export const toggleMagazineLike = async (id, action, userId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/magazine/${id}/likes`, { action, userId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du toggle like:', error);
    throw error;
  }
};

// Récupérer les stats d'un Magazine
export const getMagazineStats = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/magazine/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    throw error;
  }
};
