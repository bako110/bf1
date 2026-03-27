import React, { useEffect, useState } from 'react';
import { seriesService } from '../services/seriesService';
import { uploadVideo } from '../services/uploadService';
import Drawer from './Drawer';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import Alert from './ui/Alert';
import Loader from './ui/Loader';
import ConfirmModal from './ui/ConfirmModal';
import ImageUpload from './ui/ImageUpload';
import DataTable from './ui/DataTable';
import Pagination from './ui/Pagination';

export default function EpisodeManager({ series, onClose }) {
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  
  // États pour le formulaire d'épisode
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    episode_number: 1,
    season_id: '',
    duration: 0,
    air_date: '',
    thumbnail_url: '',
    video_file: null,
    video_url: '',
    video_source: 'file', // file, url
    // is_premium et allow_comments ont été supprimés car ils ne sont pas nécessaires
  });

  // États pour l'upload vidéo
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);

  // États pour la suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState(null);

  useEffect(() => {
    if (series?.id) {
      Promise.all([
        loadSeasons(),
        loadEpisodes()
      ]);
    }
  }, [series]);

  useEffect(() => {
    loadEpisodes();
  }, [selectedSeason, currentPage]);

  const loadSeasons = async () => {
    try {
      const data = await seriesService.getSeasons(series.id);
      console.log('DEBUG loadSeasons - données brutes:', data);
      const seasonsList = Array.isArray(data) ? data : data.seasons || [];
      console.log('DEBUG loadSeasons - saisons finales:', seasonsList);
      setSeasons(seasonsList);
    } catch (e) {
      console.error('Erreur chargement saisons:', e);
    }
  };

  const loadEpisodes = async (page = currentPage) => {
    try {
      setLoading(page === 1);
      
      let data;
      if (selectedSeason === 'all') {
        data = await seriesService.getAllEpisodesFromSeries(series.id, page, itemsPerPage);
      } else {
        data = await seriesService.getEpisodes(series.id, selectedSeason, page, itemsPerPage);
      }
      
      console.log('DEBUG loadEpisodes - données brutes complètes:', JSON.stringify(data, null, 2));
      console.log('DEBUG loadEpisodes - typeof data:', typeof data);
      console.log('DEBUG loadEpisodes - Array.isArray(data):', Array.isArray(data));
      console.log('DEBUG loadEpisodes - data.episodes:', data?.episodes);
      
      // Extraire les épisodes correctement
      let episodesList = [];
      
      if (Array.isArray(data)) {
        // Si c'est un tableau directement
        episodesList = data;
      } else if (data?.episodes && Array.isArray(data.episodes)) {
        // Si c'est un objet avec propriété episodes
        episodesList = data.episodes;
      } else if (data?.data && Array.isArray(data.data)) {
        // Si c'est un objet avec propriété data
        episodesList = data.data;
      } else {
        console.warn('⚠️ Format de réponse inattendu:', data);
        episodesList = [];
      }
      
      // Ajouter season_id si manquant et mapper _id à id
      episodesList = episodesList.map(episode => ({
        ...episode,
        id: episode.id || episode._id, // MongoDB utilise _id
        season_id: episode.season_id || selectedSeason
      }));
      
      console.log('DEBUG loadEpisodes - épisodes finaux après mapping:', episodesList);
      console.log('DEBUG loadEpisodes - Nombre d\'épisodes:', episodesList.length);
      console.log('DEBUG loadEpisodes - État avant setEpisodes');
      
      console.log('DEBUG - Appel de setEpisodes avec:', episodesList);
      setEpisodes(episodesList);
      setTotalItems(data?.total || episodesList.length);
      setTotalPages(Math.ceil((data?.total || episodesList.length) / itemsPerPage));
      setCurrentPage(page);
      setError('');
      console.log('DEBUG - État episodes après setEpisodes (sera affiché après re-render)');
    } catch (e) {
      console.error('Erreur chargement épisodes:', e);
      setError('Erreur lors du chargement des épisodes.');
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Formate la date pour le champ input type="date"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split('T')[0];
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingVideo(true);
      setUploadVideoProgress(0);
      
      const result = await uploadVideo(file, (progress) => {
        setUploadVideoProgress(progress);
      });
      
      setForm({ 
        ...form, 
        video_url: result.url,
        video_file: file,
        video_source: 'file'
      });
      setSuccess('Vidéo uploadée avec succès.');
    } catch (e) {
      setError('Erreur lors de l\'upload de la vidéo.');
    } finally {
      setUploadingVideo(false);
      setUploadVideoProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.season_id) {
      setError('Le titre et la saison sont requis.');
      return;
    }

    if (form.video_source === 'file' && !form.video_file && !form.video_url) {
      setError('Veuillez uploader une vidéo ou fournir une URL.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Ne garder que les champs acceptés par le backend
      const episodeData = {
        episode_number: parseInt(form.episode_number),
        title: form.title,
        description: form.description || undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
        video_url: form.video_url || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        release_date: form.air_date || undefined,
        status: form.status || 'upcoming',
        series_id: series.id,
        season_id: form.season_id
      };

      // Filtrer les undefined
      Object.keys(episodeData).forEach(key => 
        episodeData[key] === undefined && delete episodeData[key]
      );

      if (editingEpisode) {
        console.log('DEBUG updateEpisode:', { seriesId: series.id, seasonId: form.season_id, episodeId: editingEpisode.id, episodeData });
        await seriesService.updateEpisode(series.id, form.season_id, editingEpisode.id, episodeData);
        setSuccess('Épisode modifié avec succès.');
      } else {
        console.log('DEBUG createEpisode:', { seriesId: series.id, seasonId: form.season_id, episodeData });
        await seriesService.createEpisode(series.id, form.season_id, episodeData);
        setSuccess('Épisode créé avec succès.');
      }

      handleCloseForm();
      loadEpisodes();
      loadSeasons(); // Pour mettre à jour le compteur d'épisodes
    } catch (e) {
      console.error('Erreur sauvegarde épisode:', e);
      
      // Gestión des erreurs de validation du backend
      let errorMessage = 'Erreur lors de la sauvegarde.';
      
      if (e?.response?.data) {
        const errorData = e.response.data;
        
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Erreurs de validation Pydantic
          errorMessage = errorData.detail.map(err => {
            if (typeof err === 'string') return err;
            if (err.msg) return `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`;
            return 'Erreur de validation';
          }).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (episode) => {
    try {
      const episodeData = await seriesService.getEpisodeById(series.id, episode.season_id, episode.id);
      console.log('DEBUG handleEdit - episodeData:', episodeData);
      setForm({
        title: episodeData.title || '',
        description: episodeData.description || '',
        episode_number: episodeData.episode_number || 1,
        season_id: episode.season_id || episodeData.season_id || '',
        duration: episodeData.duration || 0,
        air_date: formatDate(episodeData.release_date) || '', // release_date du backend
        thumbnail_url: episodeData.thumbnail_url || '',
        video_file: null,
        video_url: episodeData.video_url || '',
        video_source: episodeData.video_url ? 'url' : 'file',
        status: episodeData.status || 'upcoming'
      });
      setEditingEpisode(episode);
      setShowForm(true);
    } catch (e) {
      console.error('Erreur lors du chargement de l\'épisode:', e);
      setError('Erreur lors du chargement de l\'épisode.');
    }
  };

  const handleDelete = (episode) => {
    setEpisodeToDelete(episode);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!episodeToDelete) return;

    try {
      await seriesService.deleteEpisode(
        series.id, 
        episodeToDelete.season_id, 
        episodeToDelete.id
      );
      setEpisodes(episodes.filter(e => e.id !== episodeToDelete.id));
      setSuccess('Épisode supprimé avec succès.');
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setEpisodeToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEpisode(null);
    setForm({
      title: '',
      description: '',
      episode_number: 1,
      season_id: seasons[0]?.id || '',
      duration: 0,
      air_date: '',
      thumbnail_url: '',
      video_file: null,
      video_url: '',
      video_source: 'file',
      // is_premium et allow_comments ont été supprimés
    });
    setError('');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const columns = [
    { 
      key: 'episode_info',
      label: 'Épisode',
      render: (value, episode) => {
        // Vérifier que episode existe
        if (!episode) {
          return <div>-</div>;
        }
        
        // Trouver la saison correspondante pour obtenir le season_number
        const season = seasons.find(s => s.id === episode.season_id);
        const seasonNumber = season ? season.season_number : '?';
        
        return (
          <div>
            <div className="font-semibold">S{seasonNumber}E{episode.episode_number || '?'}</div>
            <div className="text-sm text-gray-600">{episode.title}</div>
          </div>
        );
      }
    },
    { 
      key: 'duration', 
      label: 'Durée',
      render: (value, episode) => episode ? formatDuration(episode.duration) : '-'
    },
    { 
      key: 'release_date', 
      label: 'Date de diffusion',
      render: (value, episode) => episode?.release_date 
        ? new Date(episode.release_date).toLocaleDateString('fr-FR')
        : 'Non définie'
    }
  ];

  const actions = [
    {
      label: 'Modifier',
      onClick: (row) => handleEdit(row),
      icon: 'edit',
      className: 'text-indigo-600 hover:text-indigo-900'
    },
    {
      label: 'Supprimer',
      onClick: (row) => handleDelete(row),
      icon: 'trash-2',
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  if (loading && episodes.length === 0) return <Loader />;

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={`Épisodes - ${series?.title}`}
    >
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Header avec filtres et bouton d'ajout */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par saison
                </label>
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Toutes les saisons</option>
                  {seasons
                    .sort((a, b) => a.season_number - b.season_number)
                    .map((season) => (
                      <option key={season.id} value={season.id}>
                        Saison {season.season_number}: {season.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Épisodes ({totalItems})
              </h3>
              <p className="text-sm text-gray-600">
                Gérez les épisodes de votre série
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            icon="plus"
            disabled={seasons.length === 0}
          >
            Nouvel épisode
          </Button>
        </div>

        {seasons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl text-gray-300 mb-4">📺</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune saison disponible
            </h3>
            <p className="text-gray-600">
              Vous devez d'abord créer au moins une saison avant de pouvoir ajouter des épisodes.
            </p>
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl text-gray-300 mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun épisode
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedSeason === 'all' 
                ? 'Commencez par créer le premier épisode de votre série.'
                : 'Aucun épisode dans cette saison.'
              }
            </p>
            <Button
              onClick={() => setShowForm(true)}
              icon="plus"
            >
              Créer le premier épisode
            </Button>
          </div>
        ) : (
          <>
            <DataTable
              data={episodes}
              columns={columns}
              actions={actions}
              loading={loading}
            />
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => loadEpisodes(page)}
              />
            )}
          </>
        )}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <Drawer
            isOpen={showForm}
            onClose={handleCloseForm}
            title={editingEpisode ? 'Modifier l\'épisode' : 'Nouvel épisode'}
          >
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saison <span style={{color: 'red'}}>*</span>
                    </label>
                    <select
                      value={form.season_id}
                      onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Sélectionnez une saison</option>
                      {seasons
                        .sort((a, b) => a.season_number - b.season_number)
                        .map((season) => (
                          <option key={season.id} value={season.id}>
                            Saison {season.season_number}: {season.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <FormInput
                    label={<span>Numéro d'épisode <span style={{color: 'red'}}>*</span></span>}
                    type="number"
                    value={form.episode_number}
                    onChange={(e) => setForm({ ...form, episode_number: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <FormInput
                  label={<span>Titre de l'épisode <span style={{color: 'red'}}>*</span></span>}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Ex: Le commencement"
                />

                <FormTextarea
                  label="Description courte"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Description courte pour les listings..."
                />
              </div>

              {/* Détails techniques */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Détails techniques</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Durée (minutes)"
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    min="1"
                    max="300"
                  />
                  
                  <FormInput
                    label="Date de diffusion"
                    type="date"
                    value={form.air_date}
                    onChange={(e) => setForm({ ...form, air_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Médias */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Médias</h3>
                
                <ImageUpload
                  label="Miniature de l'épisode"
                  value={form.thumbnail_url}
                  onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                  aspectRatio="16:9"
                />

                {/* Vidéo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source vidéo
                  </label>
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={form.video_source === 'file'}
                        onChange={(e) => setForm({ ...form, video_source: e.target.value })}
                        className="mr-2"
                      />
                      Fichier vidéo
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={form.video_source === 'url'}
                        onChange={(e) => setForm({ ...form, video_source: e.target.value })}
                        className="mr-2"
                      />
                      URL externe
                    </label>
                  </div>

                  {form.video_source === 'file' ? (
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e.target.files[0])}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        disabled={uploadingVideo}
                      />
                      {uploadingVideo && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadVideoProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Upload en cours: {uploadVideoProgress}%
                          </p>
                        </div>
                      )}
                      {form.video_url && !uploadingVideo && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Vidéo uploadée
                        </p>
                      )}
                    </div>
                  ) : (
                    <FormInput
                      label="URL de la vidéo"
                      type="url"
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      placeholder="https://..."
                    />
                  )}
                </div>
              </div>

              {/* Options - Supprimé car non supporté par le backend */}
              {/* Tous les épisodes d'une série premium sont automatiquement premium */}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || uploadingVideo}
                  loading={submitting}
                >
                  {editingEpisode ? 'Modifier' : 'Créer'} l'épisode
                </Button>
              </div>
            </form>
          </Drawer>
        )}

        {/* Modal de confirmation de suppression */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Supprimer l'épisode"
          message="Êtes-vous sûr de vouloir supprimer cet épisode ?"
          type="danger"
        />
      </div>
    </Drawer>
  );
}