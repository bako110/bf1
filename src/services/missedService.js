import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

// Récupérer tous les contenus manqués
export const fetchMissed = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const response = await axios.get(`${API_BASE_URL}/missed?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus manqués:', error);
    throw error;
  }
};

// Récupérer un contenu manqué par ID
export const getMissedById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu manqué:', error);
    throw error;
  }
};

// Créer un nouveau contenu manqué
export const createMissed = async (missedData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_BASE_URL}/missed`, missedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du contenu manqué:', error);
    throw error;
  }
};

// Mettre à jour un contenu manqué
export const updateMissed = async (id, missedData) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_BASE_URL}/missed/${id}`, missedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu manqué:', error);
    throw error;
  }
};

// Supprimer un contenu manqué
export const deleteMissed = async (id) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_BASE_URL}/missed/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du contenu manqué:', error);
    throw error;
  }
};

// Rechercher des contenus manqués
export const searchMissed = async (query, skip = 0, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/search?q=${query}&skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de contenus manqués:', error);
    throw error;
  }
};

// Récupérer les contenus manqués par catégorie
export const getMissedByCategory = async (category, skip = 0, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/category/${category}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus manqués par catégorie:', error);
    throw error;
  }
};

// Incrémenter les vues d'un contenu manqué
export const incrementMissedViews = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/missed/${id}/increment-views`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};

// Récupérer les commentaires d'un contenu manqué
export const getMissedComments = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/${id}/comments`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    throw error;
  }
};

// Récupérer le nombre de likes
export const getMissedLikesCount = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/${id}/likes/count`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de likes:', error);
    throw error;
  }
};

// Récupérer le nombre de partages
export const getMissedSharesCount = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missed/${id}/shares/count`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de partages:', error);
    throw error;
  }
};
