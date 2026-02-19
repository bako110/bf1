import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

const emissionService = {
  // Récupérer toutes les émissions
  getAllEmissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions`);
      return response.data.emissions || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des émissions:', error);
      throw error;
    }
  },

  // Récupérer une émission par ID
  getEmissionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'émission:', error);
      throw error;
    }
  },

  // Créer une nouvelle émission
  createEmission: async (emissionData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/emissions`, emissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'émission:', error);
      throw error;
    }
  },

  // Mettre à jour une émission
  updateEmission: async (id, emissionData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.put(`${API_BASE_URL}/emissions/${id}`, emissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'émission:', error);
      throw error;
    }
  },

  // Supprimer une émission
  deleteEmission: async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`${API_BASE_URL}/emissions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'émission:', error);
      throw error;
    }
  },

  // Récupérer les émissions en vedette
  getFeaturedEmissions: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des émissions featured:', error);
      throw error;
    }
  },

  // Récupérer les nouvelles émissions
  getNewEmissions: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions/new?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des nouvelles émissions:', error);
      throw error;
    }
  },

  // Rechercher des émissions
  searchEmissions: async (query, category = null, limit = 20, offset = 0) => {
    try {
      const params = new URLSearchParams({
        query,
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (category) {
        params.append('category', category);
      }
      
      const response = await axios.get(`${API_BASE_URL}/emissions/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'émissions:', error);
      throw error;
    }
  },

  // Incrémenter les vues d'une émission
  incrementViews: async (id, options = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emissions/${id}/views`, options);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      throw error;
    }
  },

  // Gérer les likes d'une émission
  toggleLike: async (id, action, userId = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emissions/${id}/likes`, {
        action,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion du like:', error);
      throw error;
    }
  },

  // Récupérer les statistiques d'une émission
  getEmissionStats: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer les catégories
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emissions/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
};

export { emissionService };
