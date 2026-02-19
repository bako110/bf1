import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

// Récupérer tous les reportages
export const fetchReportages = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reportage?page=${page}&per_page=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des reportages:', error);
    throw error;
  }
};

// Récupérer un reportage par ID
export const getReportageById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reportage/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du reportage:', error);
    throw error;
  }
};

// Créer un nouveau reportage
export const createReportage = async (reportageData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_BASE_URL}/reportage`, reportageData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du reportage:', error);
    throw error;
  }
};

// Mettre à jour un reportage
export const updateReportage = async (id, reportageData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_BASE_URL}/reportage/${id}`, reportageData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du reportage:', error);
    throw error;
  }
};

// Supprimer un reportage
export const deleteReportage = async (id) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_BASE_URL}/reportage/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du reportage:', error);
    throw error;
  }
};

// Récupérer les reportages en vedette
export const getFeaturedReportages = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reportage/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des reportages featured:', error);
    throw error;
  }
};

// Rechercher des reportages
export const searchReportages = async (query, limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reportage/search?query=${query}&limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de reportages:', error);
    throw error;
  }
};

// Incrémenter les vues d'un reportage
export const incrementReportageViews = async (id, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reportage/${id}/views`, options);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};

// Gérer les likes d'un reportage
export const toggleReportageLike = async (id, action, userId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reportage/${id}/likes`, {
      action,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error);
    throw error;
  }
};

// Récupérer les statistiques d'un reportage
export const getReportageStats = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reportage/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
