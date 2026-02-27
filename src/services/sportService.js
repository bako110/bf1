import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

const sportService = {
  // Récupérer tous les sports
  getAllSports: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports`);
      return response.data.sports || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sports:', error);
      throw error;
    }
  },

  // Récupérer un sport par ID
  getSportById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du sport:', error);
      throw error;
    }
  },

  // Créer un nouveau sport
  createSport: async (sportData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/sports`, sportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du sport:', error);
      throw error;
    }
  },

  // Mettre à jour un sport
  updateSport: async (id, sportData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.put(`${API_BASE_URL}/sports/${id}`, sportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sport:', error);
      throw error;
    }
  },

  // Supprimer un sport
  deleteSport: async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`${API_BASE_URL}/sports/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du sport:', error);
      throw error;
    }
  },

  // Récupérer les sports en vedette
  getFeaturedSports: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des sports featured:', error);
      throw error;
    }
  },

  // Récupérer les nouveaux sports
  getNewSports: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/new?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des nouveaux sports:', error);
      throw error;
    }
  },

  // Rechercher des sports
  searchSports: async (query, category = null, limit = 20, offset = 0) => {
    try {
      const params = new URLSearchParams({
        query,
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (category) {
        params.append('category', category);
      }
      
      const response = await axios.get(`${API_BASE_URL}/sports/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de sports:', error);
      throw error;
    }
  },

  // Incrémenter les vues d'un sport
  incrementViews: async (id, options = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sports/${id}/views`, options);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      throw error;
    }
  },

  // Gérer les likes d'un sport
  toggleLike: async (id, action, userId = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sports/${id}/likes`, {
        action,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion du like:', error);
      throw error;
    }
  },

  // Récupérer les statistiques d'un sport
  getSportStats: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer les catégories
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
};

export { sportService };
