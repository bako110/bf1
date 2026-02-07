import React, { useEffect, useState } from 'react';
import { fetchBreakingNews, createBreakingNews, updateBreakingNews, deleteBreakingNews } from '../services/breakingNewsService';
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

export default function BreakingNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', category: '', description: '', image: '', author: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadBreakingNews();
  }, []);

  async function loadBreakingNews() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBreakingNews();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des breaking news.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateBreakingNews(editId, form);
        setSuccess('Breaking news modifiée avec succès.');
      } else {
        await createBreakingNews(form);
        setSuccess('Breaking news créée avec succès.');
      }
      handleClose();
      loadBreakingNews();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette breaking news ?')) {
      try {
        await deleteBreakingNews(id);
        setSuccess('Breaking news supprimée.');
        loadBreakingNews();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({
      title: item.title || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      author: item.author || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', category: '', description: '', image: '', author: '' });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'author', label: 'Auteur' },
    { 
      key: 'created_at', 
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
          title="Gestion des Breaking News"
          description="Créer et gérer les actualités urgentes"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Breaking News
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier la Breaking News' : 'Nouvelle Breaking News'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titre"
              placeholder="Titre de l'actualité"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <FormInput
              label="Catégorie"
              placeholder="Ex: Politique, Économie, Sports"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              required
            />
            <FormInput
              label="Auteur"
              placeholder="Nom de l'auteur"
              value={form.author}
              onChange={e => setForm({...form, author: e.target.value})}
              required
            />
            <FormTextarea
              label="Description"
              placeholder="Contenu de l'actualité..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={6}
              required
            />
            <ImageUpload
              label="Image de l'Actualité"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              helperText="Sélectionnez une image pour l'actualité"
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
                onClick={handleClose}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des breaking news..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="📰"
            title="Aucune breaking news"
            message="Créez votre première breaking news pour la voir apparaître ici."
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
