import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.137.1:8000/api/v1';

const seriesService = {
  // ====================================
  // GESTION DES SÉRIES
  // ====================================

  // Récupérer toutes les séries
  getAllSeries: async (page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/tv/series?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des séries:', error);
      throw error;
    }
  },

  // Récupérer une série par ID
  getSeriesById: async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/tv/series/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la série:', error);
      throw error;
    }
  },

  // Créer une nouvelle série
  createSeries: async (seriesData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/tv/series`, seriesData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la série:', error);
      throw error;
    }
  },

  // Mettre à jour une série
  updateSeries: async (id, seriesData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.put(`${API_BASE_URL}/tv/series/${id}`, seriesData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la série:', error);
      throw error;
    }
  },

  // Supprimer une série
  deleteSeries: async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`${API_BASE_URL}/tv/series/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la série:', error);
      throw error;
    }
  },

  // ====================================
  // GESTION DES SAISONS
  // ====================================

  // Récupérer les saisons d'une série
  getSeasons: async (seriesId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/tv/series/${seriesId}/seasons`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des saisons:', error);
      throw error;
    }
  },

  // Créer une nouvelle saison
  createSeason: async (seriesId, seasonData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/tv/series/${seriesId}/seasons`, seasonData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la saison:', error);
      throw error;
    }
  },

  // Mettre à jour une saison
  updateSeason: async (seriesId, seasonId, seasonData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.put(`${API_BASE_URL}/tv/series/${seriesId}/seasons/${seasonId}`, seasonData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la saison:', error);
      throw error;
    }
  },

  // Supprimer une saison
  deleteSeason: async (seriesId, seasonId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`${API_BASE_URL}/tv/series/${seriesId}/seasons/${seasonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la saison:', error);
      throw error;
    }
  },

  // ====================================
  // GESTION DES ÉPISODES
  // ====================================

  // Récupérer les épisodes d'une saison
  getEpisodes: async (seriesId, seasonId, page = 1, limit = 50) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Si on veut les épisodes d'une saison spécifique
      if (seasonId && seasonId !== 'all') {
        const response = await axios.get(`${API_BASE_URL}/tv/seasons/${seasonId}/episodes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return {
          episodes: response.data || [],
          total: response.data ? response.data.length : 0,
          page: 1,
          pages: 1
        };
      } else {
        // Sinon récupérer tous les épisodes de la série
        const response = await axios.get(`${API_BASE_URL}/tv/series/${seriesId}/episodes?page=${page}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes:', error);
      throw error;
    }
  },

  // Récupérer tous les épisodes d'une série
  getAllEpisodesFromSeries: async (seriesId, page = 1, limit = 100) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/tv/series/${seriesId}/episodes?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes:', error);
      throw error;
    }
  },

  // Récupérer un épisode par ID
  getEpisodeById: async (seriesId, seasonId, episodeId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/tv/episodes/${episodeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'épisode:', error);
      throw error;
    }
  },

  // Créer un nouvel épisode
  createEpisode: async (seriesId, seasonId, episodeData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/tv/seasons/${seasonId}/episodes`, episodeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'épisode:', error);
      throw error;
    }
  },

  // Mettre à jour un épisode
  updateEpisode: async (seriesId, seasonId, episodeId, episodeData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.patch(`${API_BASE_URL}/tv/episodes/${episodeId}`, episodeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'épisode:', error);
      throw error;
    }
  },

  // Supprimer un épisode
  deleteEpisode: async (seriesId, seasonId, episodeId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`${API_BASE_URL}/tv/episodes/${episodeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'épisode:', error);
      throw error;
    }
  },

  // ====================================
  // STATISTIQUES ET ANALYTICS
  // ====================================

  // Statistiques d'une série
  getSeriesStats: async (seriesId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/series/${seriesId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats de la série:', error);
      throw error;
    }
  },

  // Statistiques globales des séries
  getGlobalSeriesStats: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/series/stats/global`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats globales:', error);
      throw error;
    }
  },

  // ====================================
  // FONCTIONS UTILITAIRES
  // ====================================

  // Rechercher des séries
  searchSeries: async (query, page = 1, limit = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/series/search?q=${query}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de séries:', error);
      throw error;
    }
  },

  // Récupérer les genres disponibles
  getGenres: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/series/genres`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des genres:', error);
      throw error;
    }
  },

  // Dupliquer une saison (avec tous ses épisodes)
  duplicateSeason: async (seriesId, seasonId, newSeasonData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API_BASE_URL}/series/${seriesId}/seasons/${seasonId}/duplicate`, newSeasonData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la duplication de la saison:', error);
      throw error;
    }
  },

  // Réorganiser les épisodes (drag & drop)
  reorderEpisodes: async (seriesId, seasonId, episodeIds) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.put(`${API_BASE_URL}/series/${seriesId}/seasons/${seasonId}/episodes/reorder`, {
        episode_ids: episodeIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réorganisation des épisodes:', error);
      throw error;
    }
  }
};

export { seriesService };