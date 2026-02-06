import React, { useEffect, useState } from 'react';
import { fetchReels, createReel, updateReel, deleteReel } from '../services/reelService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';

export default function Reels() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', video_url: '', thumbnail_url: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'user_id', label: 'Créateur' },
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString('fr-FR') },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  useEffect(() => {
    loadReels();
  }, []);

  async function loadReels() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReels();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des reels.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateReel(editId, form);
        setSuccess('Reel modifié avec succès.');
      } else {
        await createReel(form);
        setSuccess('Reel créé avec succès.');
      }
      handleClose();
      loadReels();
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
    }
  }

  async function handleDelete(item) {
    const itemId = item.id || item._id;
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await deleteReel(itemId);
        setSuccess('Reel supprimé avec succès.');
        loadReels();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm(item);
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', description: '', video_url: '', thumbnail_url: '' });
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Reels"
          description="Créer et gérer les reels vidéo"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouveau Reel
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier le Reel' : 'Nouveau Reel'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Titre" placeholder="Titre du reel" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <FormTextarea label="Description" placeholder="Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
            <FormInput label="URL Vidéo" placeholder="https://..." value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} type="url" />
            <FormInput label="URL Vignette" placeholder="https://..." value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} type="url" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth>{editId ? 'Mettre à jour' : 'Créer'}</Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose}>Annuler</Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des reels..." />
        ) : items.length === 0 ? (
          <EmptyState icon="🎬" title="Aucun reel" message="Créez votre premier reel." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
          </div>
        )}
      </div>
    </div>
  );
}
