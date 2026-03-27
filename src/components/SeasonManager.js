import React, { useEffect, useState } from 'react';
import { seriesService } from '../services/seriesService';
import Drawer from './Drawer';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import Alert from './ui/Alert';
import Loader from './ui/Loader';
import ConfirmModal from './ui/ConfirmModal';
import ImageUpload from './ui/ImageUpload';

export default function SeasonManager({ series, onClose }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // États pour le formulaire de saison
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    season_number: 1,
    release_date: '',
    poster_url: '',
    trailer_url: '',
    episode_count: 0,
    status: 'upcoming' // upcoming, ongoing, completed
  });

  // États pour la suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState(null);

  useEffect(() => {
    if (series?.id) {
      loadSeasons();
    }
  }, [series]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const data = await seriesService.getSeasons(series.id);
      setSeasons(Array.isArray(data) ? data : data.seasons || []);
      setError('');
    } catch (e) {
      console.error('Erreur chargement saisons:', e);
      setError('Erreur lors du chargement des saisons.');
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setError('Le titre de la saison est requis.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const seasonData = {
        ...form,
        series_id: series.id,
        season_number: parseInt(form.season_number),
        episode_count: parseInt(form.episode_count)
      };

      if (editingSeason) {
        await seriesService.updateSeason(series.id, editingSeason.id, seasonData);
        setSuccess('Saison modifiée avec succès.');
      } else {
        await seriesService.createSeason(series.id, seasonData);
        setSuccess('Saison créée avec succès.');
      }

      handleCloseForm();
      loadSeasons();
    } catch (e) {
      console.error('Erreur sauvegarde saison:', e);
      
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

  // Formate la date pour le champ input type="date"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split('T')[0];
  };

  const handleEdit = (season) => {
    setForm({
      title: season.title || '',
      description: season.description || '',
      season_number: season.season_number || 1,
      release_date: formatDate(season.release_date) || '',
      poster_url: season.poster_url || '',
      trailer_url: season.trailer_url || '',
      episode_count: season.episode_count || 0,
      status: season.status || 'upcoming'
    });
    setEditingSeason(season);
    setShowForm(true);
  };

  const handleDelete = (season) => {
    setSeasonToDelete(season);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!seasonToDelete) return;

    try {
      await seriesService.deleteSeason(series.id, seasonToDelete.id);
      setSeasons(seasons.filter(s => s.id !== seasonToDelete.id));
      setSuccess('Saison supprimée avec succès.');
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setSeasonToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSeason(null);
    setForm({
      title: '',
      description: '',
      season_number: seasons.length + 1,
      release_date: '',
      poster_url: '',
      trailer_url: '',
      episode_count: 0,
      status: 'upcoming'
    });
    setError('');
  };

  const handleDuplicate = async (season) => {
    try {
      setSubmitting(true);
      const newSeasonData = {
        title: `${season.title || 'Saison'} (Copie)`,
        description: season.description,
        season_number: seasons.length + 1
      };
      
      await seriesService.duplicateSeason(series.id, season.id, newSeasonData);
      setSuccess('Saison dupliquée avec succès.');
      loadSeasons();
    } catch (e) {
      setError('Erreur lors de la duplication.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'ongoing': return 'En cours';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  if (loading) return <Loader />;

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={`Saisons - ${series?.title}`}
    >
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Header avec bouton d'ajout */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Saisons ({seasons.length})
            </h3>
            <p className="text-sm text-gray-600">
              Gérez les saisons de votre série
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            icon="plus"
          >
            Ajouter une saison
          </Button>
        </div>

        {/* Liste des saisons */}
        <div className="space-y-4">
          {seasons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl text-gray-300 mb-4">📺</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune saison
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer la première saison de votre série.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                icon="plus"
              >
                Créer la première saison
              </Button>
            </div>
          ) : (
            seasons
              .sort((a, b) => a.season_number - b.season_number)
              .map((season) => (
                <div
                  key={season.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Informations de la saison */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Saison {season.season_number}: {season.title || 'Sans titre'}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(season.status)}`}>
                            {getStatusLabel(season.status)}
                          </span>
                        </div>
                        
                        {season.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {season.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>{season.episode_count || 0} épisodes</span>
                          {season.release_date && (
                            <span>Sortie: {new Date(season.release_date).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDuplicate(season)}
                        icon="copy"
                        title="Dupliquer"
                        disabled={submitting}
                      >
                        Dupliquer
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(season)}
                        icon="edit"
                        title="Modifier"
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(season)}
                        icon="trash-2"
                        title="Supprimer"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <Drawer
            isOpen={showForm}
            onClose={handleCloseForm}
            title={editingSeason ? 'Modifier la saison' : 'Nouvelle saison'}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Numéro de saison"
                  type="number"
                  value={form.season_number}
                  onChange={(e) => setForm({ ...form, season_number: e.target.value })}
                  min="1"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="upcoming">À venir</option>
                    <option value="ongoing">En cours</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>

              <FormInput
                label="Titre de la saison"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Ex: Première saison, Saison des révélations..."
              />

              <FormTextarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Décrivez l'arc narratif de cette saison..."
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Date de sortie"
                  type="date"
                  value={form.release_date}
                  onChange={(e) => setForm({ ...form, release_date: e.target.value })}
                />
                
                <FormInput
                  label="Nombre d'épisodes prévus"
                  type="number"
                  value={form.episode_count}
                  onChange={(e) => setForm({ ...form, episode_count: e.target.value })}
                  min="0"
                />
              </div>

              <ImageUpload
                label="Poster de la saison (optionnel)"
                value={form.poster_url}
                onChange={(url) => setForm({ ...form, poster_url: url })}
                aspectRatio="2:3"
              />

              <FormInput
                label="URL Bande-annonce (optionnel)"
                type="url"
                value={form.trailer_url}
                onChange={(e) => setForm({ ...form, trailer_url: e.target.value })}
                placeholder="https://..."
              />

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
                  disabled={submitting}
                  loading={submitting}
                >
                  {editingSeason ? 'Modifier' : 'Créer'} la saison
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
          title="Supprimer la saison"
          message="Êtes-vous sûr de vouloir supprimer cette saison ? Tous les épisodes associés seront également supprimés."
          type="danger"
        />
      </div>
    </Drawer>
  );
}