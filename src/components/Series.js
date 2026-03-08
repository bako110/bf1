import React, { useEffect, useState } from 'react';
import { seriesService } from '../services/seriesService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import ImageUpload from './ui/ImageUpload';
import ConfirmModal from './ui/ConfirmModal';
import Pagination from './ui/Pagination';
import SeasonManager from './SeasonManager';
import EpisodeManager from './EpisodeManager';

export default function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: [],
    release_year: new Date().getFullYear(),
    country: 'Sénégal',
    language: 'Français',
    status: 'ongoing', // ongoing, completed, cancelled, hiatus
    rating: 'G', // G, PG, PG-13, R, NC-17
    image_url: '',
    banner_url: '',
    trailer_url: '',
    is_premium: false,
    allow_comments: true,
    cast: [],
    crew: [],
    production_company: '',
    network: 'BF1',
    episode_duration: 45, // durée moyenne en minutes
    total_seasons: 1,
    total_episodes: 0
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  
  // États pour la gestion des saisons et épisodes
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [showSeasonManager, setShowSeasonManager] = useState(false);
  const [showEpisodeManager, setShowEpisodeManager] = useState(false);
  
  // État pour la vue détaillée
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Genres disponibles pour les séries
  const availableGenres = [
    'Action', 'Aventure', 'Animation', 'Biographique', 'Comédie', 'Crime', 
    'Documentaire', 'Drame', 'Famille', 'Fantasy', 'Histoire', 'Horreur', 
    'Musical', 'Mystère', 'Romance', 'Science-Fiction', 'Sport', 'Thriller', 
    'Western', 'Actualité', 'Talk-Show', 'Téléréalité'
  ];

  const statusOptions = [
    { value: 'ongoing', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'hiatus', label: 'En pause' }
  ];

  const ratingOptions = [
    { value: 'G', label: 'G - Tout public' },
    { value: 'PG', label: 'PG - Accord parental souhaité' },
    { value: 'PG-13', label: 'PG-13 - Plus de 13 ans' },
    { value: 'R', label: 'R - Plus de 17 ans' },
    { value: 'NC-17', label: 'NC-17 - Plus de 18 ans' }
  ];

  useEffect(() => {
    loadSeries();
  }, []);

  async function loadSeries(page = 1, append = false) {
    try {
      if (!append) {
        page === 1 ? setLoading(true) : setPaginationLoading(true);
      }

      const response = await seriesService.getAllSeries(page, itemsPerPage);
      
      if (response && response.series) {
        if (append && page > 1) {
          setSeries(prev => [...prev, ...response.series]);
        } else {
          setSeries(response.series);
        }
        
        setTotalItems(response.total || response.series.length);
        setTotalPages(Math.ceil((response.total || response.series.length) / itemsPerPage));
        setCurrentPage(page);
      }
      
      setError('');
    } catch (e) {
      console.error('Erreur lors du chargement des séries:', e);
      setError('Erreur lors du chargement des séries.');
      setSeries([]);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadSeries(page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.description.trim()) {
      setError('Le titre et la description sont requis.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const seriesData = {
        ...form,
        genre: Array.isArray(form.genre) ? form.genre : form.genre.split(',').map(g => g.trim()),
        cast: Array.isArray(form.cast) ? form.cast : form.cast.split(',').map(c => c.trim()).filter(Boolean),
        crew: Array.isArray(form.crew) ? form.crew : form.crew.split(',').map(c => c.trim()).filter(Boolean),
        release_year: parseInt(form.release_year),
        episode_duration: parseInt(form.episode_duration),
        total_seasons: parseInt(form.total_seasons)
      };
      
      if (editId) {
        await seriesService.updateSeries(editId, seriesData);
        setSuccess('Série modifiée avec succès.');
      } else {
        await seriesService.createSeries(seriesData);
        setSuccess('Série créée avec succès.');
      }
      
      handleClose();
      loadSeries();
    } catch (e) {
      console.error('Erreur lors de la sauvegarde:', e);
      
      // Gestión des erreurs de validation du backend
      let errorMessage = 'Erreur lors de la sauvegarde de la série.';
      
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

  const handleEdit = async (id) => {
    try {
      const seriesData = await seriesService.getSeriesById(id);
      setForm({
        ...seriesData,
        cast: Array.isArray(seriesData.cast) ? seriesData.cast.join(', ') : seriesData.cast || '',
        crew: Array.isArray(seriesData.crew) ? seriesData.crew.join(', ') : seriesData.crew || '',
        genre: Array.isArray(seriesData.genre) ? seriesData.genre : []
      });
      setEditId(id);
      setIsDrawerOpen(true);
      setError('');
    } catch (e) {
      setError('Erreur lors du chargement de la série.');
    }
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await seriesService.deleteSeries(itemToDelete);
      setSeries(series.filter(s => s.id !== itemToDelete));
      setSuccess('Série supprimée avec succès.');
    } catch (e) {
      setError('Erreur lors de la suppression de la série.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      title: '',
      description: '',
      genre: [],
      release_year: new Date().getFullYear(),
      country: 'Sénégal',
      language: 'Français',
      status: 'ongoing',
      rating: 'G',
      image_url: '',
      banner_url: '',
      trailer_url: '',
      is_premium: false,
      allow_comments: true,
      cast: [],
      crew: [],
      production_company: '',
      network: 'BF1',
      episode_duration: 45,
      total_seasons: 1,
      total_episodes: 0
    });
    setError('');
  };

  const handleGenreToggle = (genre) => {
    const currentGenres = Array.isArray(form.genre) ? form.genre : [];
    if (currentGenres.includes(genre)) {
      setForm({ ...form, genre: currentGenres.filter(g => g !== genre) });
    } else {
      setForm({ ...form, genre: [...currentGenres, genre] });
    }
  };

  // Gestionnaire pour ouvrir le manager des saisons
  const handleManageSeasons = (seriesData) => {
    console.log('🔵 Gérer les saisons pour:', seriesData);
    setSelectedSeries(seriesData);
    setShowSeasonManager(true);
  };

  // Gestionnaire pour ouvrir le manager des épisodes
  const handleManageEpisodes = (seriesData) => {
    console.log('🟣 Gérer les épisodes pour:', seriesData);
    setSelectedSeries(seriesData);
    setShowEpisodeManager(true);
  };

  const columns = [
    {
      key: 'image_url',
      label: 'Image',
      render: (val, item) => (
        <div className="relative">
          <img 
            src={item.image_url || 'https://via.placeholder.com/80x120/e5e7eb/6b7280?text=S%C3%A9rie'} 
            alt={item.title || 'Série'}
            className="w-12 h-16 object-cover rounded shadow-sm"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/80x120/e5e7eb/6b7280?text=S%C3%A9rie';
            }}
          />
        </div>
      )
    },
    { 
      key: 'title', 
      label: 'Titre',
      render: (val, item) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{item.title || 'Sans titre'}</div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]">
            {item.description ? item.description.substring(0, 80) + '...' : 'Aucune description'}
          </div>
        </div>
      )
    },
    { 
      key: 'genre', 
      label: 'Genres',
      render: (val, item) => {
        const genres = Array.isArray(item.genre) ? item.genre : [];
        if (genres.length === 0) {
          return <span className="text-gray-400 text-xs">Aucun genre</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {g}
              </span>
            ))}
            {genres.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{genres.length - 2}
              </span>
            )}
          </div>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Statut',
      render: (val, item) => {
        const statusColors = {
          ongoing: 'bg-green-100 text-green-800',
          completed: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-red-100 text-red-800',
          hiatus: 'bg-yellow-100 text-yellow-800'
        };
        const status = item.status || 'ongoing';
        const statusLabel = statusOptions.find(opt => opt.value === status)?.label || status;
        return (
          <span className={`px-2 py-1 text-xs rounded ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {statusLabel}
          </span>
        );
      }
    },
    { 
      key: 'seasons_episodes', 
      label: 'Saisons/Épisodes',
      render: (val, item) => (
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900">
            {item.total_seasons || 0}
          </div>
          <div className="text-xs text-gray-500">saisons</div>
          <div className="text-sm text-gray-600 mt-1">
            {item.total_episodes || 0} épisodes
          </div>
        </div>
      )
    },
    { 
      key: 'details', 
      label: 'Détails',
      render: (val, item) => (
        <div className="space-y-1 text-xs">
          <div className="text-gray-900">
            <span className="font-medium">Année:</span> {item.release_year || 'N/A'}
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Durée:</span> {item.episode_duration || 45} min/ép
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Réseau:</span> {item.network || 'BF1'}
          </div>
        </div>
      )
    },
    { 
      key: 'premium_status', 
      label: 'Type',
      render: (val, item) => (
        <div className="space-y-1">
          <span className={`px-2 py-1 text-xs rounded block text-center ${
            item.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {item.is_premium ? 'Premium' : 'Gratuit'}
          </span>
          <div className="text-xs text-gray-500 text-center">
            {item.views_count || 0} vues
          </div>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Gérer les saisons',
      onClick: (row) => handleManageSeasons(row),
      icon: 'layers',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Gérer les épisodes',
      onClick: (row) => handleManageEpisodes(row),
      icon: 'play-circle',
      className: 'text-purple-600 hover:text-purple-900'
    },
    {
      label: 'Modifier',
      onClick: (row) => handleEdit(row.id || row._id),
      icon: 'edit',
      className: 'text-indigo-600 hover:text-indigo-900'
    },
    {
      label: 'Supprimer',
      onClick: (row) => handleDelete(row.id || row._id),
      icon: 'trash-2',
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestion des Séries TV" 
        description="Gérez vos séries, saisons et épisodes"
        action={
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            variant="primary"
          >
            + Nouvelle Série
          </Button>
        }
      />
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {series.length === 0 ? (
        <EmptyState
          icon="tv"
          title="Aucune série"
          description="Commencez par créer votre première série TV."
          buttonText="Créer une série"
          onButtonClick={() => setIsDrawerOpen(true)}
        />
      ) : (
        <>
          <DataTable
            data={series}
            columns={columns}
            actions={actions}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={paginationLoading}
          />
        </>
      )}

      {/* Drawer pour créer/modifier une série */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title={editId ? 'Modifier la série' : 'Nouvelle série'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
            
            <FormInput
              label="Titre de la série"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Ex: Game of Thrones"
            />
            
            <FormTextarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              placeholder="Décrivez l'intrigue de votre série..."
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Année de sortie"
                type="number"
                value={form.release_year}
                onChange={(e) => setForm({ ...form, release_year: e.target.value })}
                min="1900"
                max={new Date().getFullYear() + 5}
              />
              
              <FormInput
                label="Durée moyenne épisode (min)"
                type="number"
                value={form.episode_duration}
                onChange={(e) => setForm({ ...form, episode_duration: e.target.value })}
                min="1"
                max="300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Pays"
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Ex: Sénégal"
              />
              
              <FormInput
                label="Langue"
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="Ex: Français"
              />
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Genres</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableGenres.map((genre) => (
                <label key={genre} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(Array.isArray(form.genre) ? form.genre : []).includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-sm">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Statut et Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Statut & Classification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la série
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classification d'âge
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cast & Crew */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribution & Équipe</h3>
            
            <FormInput
              label="Acteurs principaux"
              type="text"
              value={form.cast}
              onChange={(e) => setForm({ ...form, cast: e.target.value })}
              placeholder="Séparez les noms par des virgules"
            />
            
            <FormInput
              label="Équipe technique"
              type="text"
              value={form.crew}
              onChange={(e) => setForm({ ...form, crew: e.target.value })}
              placeholder="Réalisateur, Producteur, etc. (séparés par des virgules)"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Société de production"
                type="text"
                value={form.production_company}
                onChange={(e) => setForm({ ...form, production_company: e.target.value })}
                placeholder="Ex: BF1 Productions"
              />
              
              <FormInput
                label="Chaîne/Réseau"
                type="text"
                value={form.network}
                onChange={(e) => setForm({ ...form, network: e.target.value })}
                placeholder="Ex: BF1"
              />
            </div>
          </div>

          {/* Médias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Images & Médias</h3>
            
            <ImageUpload
              label="Image de couverture"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              aspectRatio="2:3"
            />
            
            <ImageUpload
              label="Bannière (optionnel)"
              value={form.banner_url}
              onChange={(url) => setForm({ ...form, banner_url: url })}
              aspectRatio="16:9"
            />
            
            <FormInput
              label="URL Bande-annonce (optionnel)"
              type="url"
              value={form.trailer_url}
              onChange={(e) => setForm({ ...form, trailer_url: e.target.value })}
              placeholder="https://..."
            />
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
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              loading={submitting}
            >
              {editId ? 'Modifier' : 'Créer'} la série
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer la série"
        message="Êtes-vous sûr de vouloir supprimer cette série ? Cette action supprimera également toutes les saisons et épisodes associés."
        type="danger"
      />

      {/* Gestionnaire de saisons */}
      {showSeasonManager && (
        <SeasonManager
          series={selectedSeries}
          onClose={() => {
            setShowSeasonManager(false);
            setSelectedSeries(null);
            loadSeries(); // Recharger pour mettre à jour les stats
          }}
        />
      )}

      {/* Gestionnaire d'épisodes */}
      {showEpisodeManager && (
        <EpisodeManager
          series={selectedSeries}
          onClose={() => {
            setShowEpisodeManager(false);
            setSelectedSeries(null);
            loadSeries(); // Recharger pour mettre à jour les stats
          }}
        />
      )}
    </div>
  );
}