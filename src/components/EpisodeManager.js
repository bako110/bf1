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
    is_premium: false,
    allow_comments: true,
    director: '',
    writer: '',
    guest_stars: '',
    summary: '',
    production_code: ''
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
      setSeasons(Array.isArray(data) ? data : data.seasons || []);
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
      
      setEpisodes(Array.isArray(data) ? data : data.episodes || []);
      setTotalItems(data.total || (Array.isArray(data) ? data.length : data.episodes?.length || 0));
      setTotalPages(Math.ceil((data.total || (Array.isArray(data) ? data.length : data.episodes?.length || 0)) / itemsPerPage));
      setCurrentPage(page);
      setError('');
    } catch (e) {
      console.error('Erreur chargement épisodes:', e);
      setError('Erreur lors du chargement des épisodes.');
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
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
      const episodeData = {
        ...form,
        episode_number: parseInt(form.episode_number),
        duration: parseInt(form.duration),
        guest_stars: form.guest_stars.split(',').map(gs => gs.trim()).filter(Boolean)
      };

      if (editingEpisode) {
        await seriesService.updateEpisode(series.id, form.season_id, editingEpisode.id, episodeData);
        setSuccess('Épisode modifié avec succès.');
      } else {
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
      setForm({
        ...episodeData,
        guest_stars: Array.isArray(episodeData.guest_stars) 
          ? episodeData.guest_stars.join(', ') 
          : episodeData.guest_stars || ''
      });
      setEditingEpisode(episode);
      setShowForm(true);
    } catch (e) {
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
      is_premium: false,
      allow_comments: true,
      director: '',
      writer: '',
      guest_stars: '',
      summary: '',
      production_code: ''
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
      render: (item) => {
        // Trouver la saison correspondante pour obtenir le season_number
        const season = seasons.find(s => s.id === item.series_id || s.id === item.season_id);
        const seasonNumber = season ? season.season_number : '?';
        
        return (
          <div>
            <div className="font-semibold">S{seasonNumber}E{item.episode_number || '?'}</div>
            <div className="text-sm text-gray-600">{item.title}</div>
          </div>
        );
      }
    },
    { 
      key: 'duration', 
      label: 'Durée',
      render: (item) => formatDuration(item.duration)
    },
    { 
      key: 'air_date', 
      label: 'Date de diffusion',
      render: (item) => item.air_date 
        ? new Date(item.air_date).toLocaleDateString('fr-FR')
        : 'Non définie'
    },
    { 
      key: 'is_premium', 
      label: 'Premium',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded ${
          item.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {item.is_premium ? 'Premium' : 'Gratuit'}
        </span>
      )
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
      size="2xl"
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
            size="xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saison *
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
                    label="Numéro d'épisode"
                    type="number"
                    value={form.episode_number}
                    onChange={(e) => setForm({ ...form, episode_number: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <FormInput
                  label="Titre de l'épisode"
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

                <FormTextarea
                  label="Résumé détaillé"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={4}
                  placeholder="Résumé complet de l'épisode..."
                />
              </div>

              {/* Détails de production */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Détails de production</h3>
                
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

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Réalisateur"
                    type="text"
                    value={form.director}
                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                    placeholder="Nom du réalisateur"
                  />
                  
                  <FormInput
                    label="Scénariste"
                    type="text"
                    value={form.writer}
                    onChange={(e) => setForm({ ...form, writer: e.target.value })}
                    placeholder="Nom du scénariste"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Invités spéciaux"
                    type="text"
                    value={form.guest_stars}
                    onChange={(e) => setForm({ ...form, guest_stars: e.target.value })}
                    placeholder="Noms séparés par des virgules"
                  />
                  
                  <FormInput
                    label="Code de production"
                    type="text"
                    value={form.production_code}
                    onChange={(e) => setForm({ ...form, production_code: e.target.value })}
                    placeholder="Ex: S01E01"
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

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={form.is_premium}
                      onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Contenu premium</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={form.allow_comments}
                      onChange={(e) => setForm({ ...form, allow_comments: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Autoriser les commentaires</span>
                  </label>
                </div>
              </div>

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