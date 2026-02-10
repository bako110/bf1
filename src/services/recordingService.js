import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class RecordingService {
  /**
   * Démarrer un nouvel enregistrement du flux live
   */
  async startRecording(streamUrl, title = null) {
    try {
      const response = await axios.post(
        `${API_URL}/recordings/start`,
        {
          stream_url: streamUrl,
          title: title
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Arrêter un enregistrement en cours
   */
  async stopRecording(recordingId) {
    try {
      const response = await axios.post(
        `${API_URL}/recordings/stop/${recordingId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Récupérer l'enregistrement actif
   */
  async getActiveRecording() {
    try {
      const response = await axios.get(
        `${API_URL}/recordings/active`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération enregistrement actif:', error);
      return null;
    }
  }

  /**
   * Lister tous les enregistrements
   */
  async listRecordings(skip = 0, limit = 50) {
    try {
      const response = await axios.get(
        `${API_URL}/recordings?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur liste enregistrements:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Récupérer un enregistrement par ID
   */
  async getRecording(recordingId) {
    try {
      const response = await axios.get(
        `${API_URL}/recordings/${recordingId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Mettre à jour un enregistrement
   */
  async updateRecording(recordingId, data) {
    try {
      const response = await axios.patch(
        `${API_URL}/recordings/${recordingId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Supprimer un enregistrement
   */
  async deleteRecording(recordingId) {
    try {
      const response = await axios.delete(
        `${API_URL}/recordings/${recordingId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur suppression enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Sauvegarder un enregistrement en tant que replay/émission/programme
   */
  async saveRecording(data) {
    try {
      const response = await axios.post(
        `${API_URL}/recordings/save`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur sauvegarde enregistrement:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Formater la durée en secondes en format lisible
   */
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

const recordingServiceInstance = new RecordingService();
export default recordingServiceInstance;
