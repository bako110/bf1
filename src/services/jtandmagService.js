import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

// Récupérer tous les JT et Magazines
export const fetchJTandMag = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jtandmag?page=${page}&per_page=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des JT et Magazines:', error);
    throw error;
  }
};

// Récupérer un JT/Magazine par ID
export const getJTandMagById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jtandmag/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du JT/Magazine:', error);
    throw error;
  }
};

// Créer un nouveau JT/Magazine
export const createJTandMag = async (jtandmagData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_BASE_URL}/jtandmag`, jtandmagData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du JT/Magazine:', error);
    throw error;
  }
};

// Mettre à jour un JT/Magazine
export const updateJTandMag = async (id, jtandmagData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_BASE_URL}/jtandmag/${id}`, jtandmagData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du JT/Magazine:', error);
    throw error;
  }
};

// Supprimer un JT/Magazine
export const deleteJTandMag = async (id) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_BASE_URL}/jtandmag/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du JT/Magazine:', error);
    throw error;
  }
};

// Récupérer les JT et Magazines en vedette
export const getFeaturedJTandMag = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jtandmag/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des JT et Magazines featured:', error);
    throw error;
  }
};

// Rechercher des JT et Magazines
export const searchJTandMag = async (query, limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jtandmag/search?query=${query}&limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de JT et Magazines:', error);
    throw error;
  }
};

// Incrémenter les vues d'un JT/Magazine
export const incrementJTandMagViews = async (id, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jtandmag/${id}/views`, options);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};

// Gérer les likes d'un JT/Magazine
export const toggleJTandMagLike = async (id, action, userId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jtandmag/${id}/likes`, {
      action,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error);
    throw error;
  }
};

// Récupérer les statistiques d'un JT/Magazine
export const getJTandMagStats = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jtandmag/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
