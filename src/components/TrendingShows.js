import React, { useEffect, useState } from 'react';
import { fetchTrendingShows, createTrendingShow, updateTrendingShow, deleteTrendingShow } from '../services/trendingShowService';
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

export default function TrendingShows() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', image: '', description: '', host: '', episodes: 0, views: 0, rating: 0 });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadTrendingShows();
  }, []);

  async function loadTrendingShows() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrendingShows();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des émissions tendances.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateTrendingShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createTrendingShow(form);
        setSuccess('Émission créée avec succès.');
      }
      handleClose();
      loadTrendingShows();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const itemId = item.id || item._id;
    if (window.confirm('Supprimer cette émission ?')) {
      try {
        await deleteTrendingShow(itemId);
        setSuccess('Émission supprimée.');
        loadTrendingShows();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      category: item.category || '',
      image: item.image || '',
      description: item.description || '',
      host: item.host || '',
      episodes: item.episodes || 0,
      views: item.views || 0,
      rating: item.rating || 0
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', category: '', image: '', description: '', host: '', episodes: 0, views: 0, rating: 0 });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'host', label: 'Animateur' },
    { key: 'episodes', label: 'Épisodes' },
    { key: 'views', label: 'Vues' },
    { 
      key: 'rating', 
      label: 'Note',
      render: (val) => `${val}/5`
    },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Émissions Tendances"
          description="Gérer les émissions populaires du moment"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Émission
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier l\'Émission' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Astuce :</strong> Ajoutez les émissions les plus populaires du moment.
              </p>
            </div>

            <FormInput
              label="Titre de l'Émission"
              placeholder="Le Grand Show"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormInput
              label="Catégorie"
              placeholder="Divertissement, Talk-show, Actualités..."
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              required
            />

            <FormInput
              label="Animateur/Présentateur"
              placeholder="Nom de l'animateur"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
              required
            />

            <ImageUpload
              label="Image de l'Émission"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'émission"
            />

            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Nombre d'Épisodes"
                type="number"
                placeholder="10"
                value={form.episodes}
                onChange={e => setForm({...form, episodes: parseInt(e.target.value) || 0})}
                min="0"
                required
              />

              <FormInput
                label="Nombre de Vues"
                type="number"
                placeholder="0"
                value={form.views}
                onChange={e => setForm({...form, views: parseInt(e.target.value) || 0})}
                min="0"
              />

              <FormInput
                label="Note (0-5)"
                type="number"
                placeholder="4.5"
                value={form.rating}
                onChange={e => setForm({...form, rating: parseFloat(e.target.value) || 0})}
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <FormTextarea
              label="Description"
              placeholder="Description de l'émission..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              required
            />

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  editId ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                fullWidth 
                onClick={handleClose}
                disabled={submitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des émissions tendances..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="📺"
            title="Aucune émission tendance"
            message="Créez votre première émission tendance pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={items}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
