import React, { useEffect, useState } from 'react';
import { fetchInterviews, createInterview, updateInterview, deleteInterview } from '../services/interviewService';
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
import Pagination from './ui/Pagination';

export default function Interviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', guest_name: '', guest_role: '', description: '', image: '', duration_minutes: 0, published_at: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchInterviews(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des interviews.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadInterviews(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadInterviews(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        duration_minutes: parseInt(form.duration_minutes) || 0
      };
      if (editId) {
        await updateInterview(editId, payload);
        setSuccess('Interview modifiée avec succès.');
      } else {
        await createInterview(payload);
        setSuccess('Interview créée avec succès.');
      }
      handleClose();
      loadInterviews();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ title: '', guest_name: '', guest_role: '', description: '', image: '', duration_minutes: 0, published_at: '' });
    setError('');
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer cette interview ?')) {
      try {
        await deleteInterview(id);
        setSuccess('Interview supprimée.');
        loadInterviews();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      guest_name: item.guest_name || '',
      guest_role: item.guest_role || '',
      description: item.description || '',
      image: item.image || '',
      duration_minutes: item.duration_minutes || '',
      published_at: item.published_at || ''
    });
    setEditId(item.id || item._id);
    setIsDrawerOpen(true);
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'guest_name', label: 'Invité' },
    { key: 'duration_minutes', label: 'Durée (min)' },
    { key: 'published_at', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Interviews"
          description="Créer et gérer les interviews"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Interview
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {items.length > 0 && currentPage < totalPages && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleLoadMore}
              disabled={paginationLoading}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paginationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>
                  Charger plus d'interviews ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? 'Modifier l\'Interview' : 'Nouvelle Interview'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Titre" placeholder="Titre de l'interview" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <FormInput label="Nom de l'invité" placeholder="Nom complet" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} required />
            <FormInput label="Rôle/Fonction" placeholder="Ex: Présentateur, Artiste, etc." value={form.guest_role} onChange={e => setForm({...form, guest_role: e.target.value})} required />
            <FormTextarea label="Description" placeholder="Description ou contenu..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} required />
            <ImageUpload
              label="Image de l'Interview"
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
              helperText="Sélectionnez une image pour l'interview"
            />
            <FormInput label="Durée (minutes)" placeholder="30" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} type="number" min="1" max="600" required />
            <FormInput label="Date de publication" value={form.published_at} onChange={e => setForm({...form, published_at: e.target.value})} type="datetime-local" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth>{editId ? 'Mettre à jour' : 'Créer'}</Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose}>Annuler</Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des interviews..." />
        ) : items.length === 0 ? (
          <EmptyState icon="🎤" title="Aucune interview" message="Créez votre première interview." />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              hasNextPage={currentPage < totalPages}
              hasPrevPage={currentPage > 1}
              loading={paginationLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
