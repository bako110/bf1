import React, { useEffect, useState } from 'react';
import { fetchReplays, createReplay, updateReplay, deleteReplay } from '../services/replayService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';

export default function Replays() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', show_name: '', description: '', video_url: '', air_date: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadReplays();
  }, []);

  async function loadReplays() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReplays();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des replays.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateReplay(editId, form);
        setSuccess('Replay modifié avec succès.');
      } else {
        await createReplay(form);
        setSuccess('Replay créé avec succès.');
      }
      setForm({ title: '', show_name: '', description: '', video_url: '', air_date: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadReplays();
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce replay ?')) {
      try {
        await deleteReplay(id);
        setSuccess('Replay supprimé.');
        loadReplays();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      show_name: item.show_name || '',
      description: item.description || '',
      video_url: item.video_url || '',
      air_date: item.air_date || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', show_name: '', description: '', video_url: '', air_date: '' });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'show_name', label: 'Émission' },
    { 
      key: 'air_date', 
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
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
          title="Gestion des Replays"
          description="Créer et gérer les rediffusions d'émissions"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Replay
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier le Replay' : 'Nouveau Replay'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Ex: Replay du match"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="Nom de l'émission"
              placeholder="Ex: Le Foot en Direct"
              value={form.show_name}
              onChange={e => setForm({...form, show_name: e.target.value})}
            />
            <FormTextarea
              label="Description"
              placeholder="Description de la rediffusion..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
            />
            <FormInput
              label="URL Vidéo"
              placeholder="https://exemple.com/video.mp4"
              value={form.video_url}
              onChange={e => setForm({...form, video_url: e.target.value})}
              type="url"
              required
            />
            <FormInput
              label="Date de diffusion"
              value={form.air_date}
              onChange={e => setForm({...form, air_date: e.target.value})}
              type="date"
            />
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
          <Loader size="lg" text="Chargement des replays..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="🎬"
            title="Aucun replay"
            message="Créez votre premier replay pour le voir apparaître ici."
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
