import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

// Récupérer tous les divertissements
export const fetchDivertissements = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/divertissement?page=${page}&per_page=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des divertissements:', error);
    throw error;
  }
};

// Récupérer un divertissement par ID
export const getDivertissementById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/divertissement/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du divertissement:', error);
    throw error;
  }
};

// Créer un nouveau divertissement
export const createDivertissement = async (divertissementData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_BASE_URL}/divertissement`, divertissementData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du divertissement:', error);
    throw error;
  }
};

// Mettre à jour un divertissement
export const updateDivertissement = async (id, divertissementData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_BASE_URL}/divertissement/${id}`, divertissementData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du divertissement:', error);
    throw error;
  }
};

// Supprimer un divertissement
export const deleteDivertissement = async (id) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_BASE_URL}/divertissement/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du divertissement:', error);
    throw error;
  }
};

// Récupérer les divertissements en vedette
export const getFeaturedDivertissements = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/divertissement/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des divertissements featured:', error);
    throw error;
  }
};

// Rechercher des divertissements
export const searchDivertissements = async (query, limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/divertissement/search?query=${query}&limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de divertissements:', error);
    throw error;
  }
};

// Incrémenter les vues d'un divertissement
export const incrementDivertissementViews = async (id, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/divertissement/${id}/views`, options);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};

// Gérer les likes d'un divertissement
export const toggleDivertissementLike = async (id, action, userId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/divertissement/${id}/likes`, {
      action,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error);
    throw error;
  }
};

// Récupérer les statistiques d'un divertissement
export const getDivertissementStats = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/divertissement/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
