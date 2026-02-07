import React, { useEffect, useState } from 'react';
import { fetchShows, createShow, updateShow, deleteShow } from '../services/showService';
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

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    host: '', 
    category: '', 
    image_url: '',
    live_url: '',
    replay_url: '',
    duration: '',
    is_live: false,
    views_count: 0
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchShows();
      setShows(data);
    } catch (e) {
      setError('Erreur lors du chargement des émissions.');
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
        await updateShow(editId, form);
        setSuccess('Émission modifiée avec succès.');
      } else {
        await createShow(form);
        setSuccess('Émission créée avec succès.');
      }
      setForm({ 
        title: '', 
        description: '', 
        host: '', 
        category: '', 
        image_url: '',
        live_url: '',
        replay_url: '',
        duration: '',
        is_live: false,
        views_count: 0
      });
      setEditId(null);
      setIsDrawerOpen(false);
      loadShows();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer cette émission ?')) {
      try {
        await deleteShow(id);
        setSuccess('Émission supprimée.');
        loadShows();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(show) {
    setForm({ 
      title: show.title, 
      description: show.description || '', 
      host: show.host || '',
      category: show.category || '',
      image_url: show.image_url || '',
      live_url: show.live_url || '',
      replay_url: show.replay_url || '',
      duration: show.duration || '',
      is_live: show.is_live || false,
      views_count: show.views_count || 0
    });
    setEditId(show.id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ 
      title: '', 
      description: '', 
      host: '', 
      category: '', 
      image_url: '',
      live_url: '',
      replay_url: '',
      duration: '',
      is_live: false,
      views_count: 0
    });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'host', label: 'Animateur' },
    { key: 'category', label: 'Catégorie' },
    { 
      key: 'is_live', 
      label: 'Statut',
      render: (val) => val ? 'En direct' : 'Replay'
    }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Émissions"
          description="Créer et gérer le catalogue d'émissions"
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

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier l\'Émission' : 'Nouvelle Émission'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Titre de l'émission"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="Animateur"
              placeholder="Nom de l'animateur"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
            />
            <FormInput
              label="Catégorie"
              placeholder="Catégorie"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            />
            <ImageUpload
              label="Image de l'Émission"
              value={form.image_url}
              onChange={(url) => setForm({...form, image_url: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour l'émission"
            />
            <FormInput
              label="URL du live"
              placeholder="https://example.com/live/emission"
              value={form.live_url}
              onChange={e => setForm({...form, live_url: e.target.value})}
              type="url"
            />
            <FormInput
              label="URL du replay"
              placeholder="https://example.com/replay/emission"
              value={form.replay_url}
              onChange={e => setForm({...form, replay_url: e.target.value})}
              type="url"
            />
            <FormInput
              label="Durée (format HH:MM:SS)"
              placeholder="01:30:00"
              value={form.duration}
              onChange={e => setForm({...form, duration: e.target.value})}
            />
            <FormInput
              label="Nombre de vues"
              placeholder="0"
              type="number"
              value={form.views_count}
              onChange={e => setForm({...form, views_count: parseInt(e.target.value) || 0})}
            />
            <FormTextarea
              label="Description"
              placeholder="Description de l'émission..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_live"
                checked={form.is_live} 
                onChange={e => setForm({...form, is_live: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_live" className="text-sm font-medium text-gray-700">En direct</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
              >
                {editId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleCloseDrawer}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des émissions..." />
        ) : shows.length === 0 ? (
          <EmptyState 
            icon="📺"
            title="Aucune émission"
            message="Créez votre première émission pour la voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={shows}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

