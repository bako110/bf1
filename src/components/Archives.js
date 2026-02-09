import React, { useEffect, useState } from 'react';
import { fetchArchives, createArchive, updateArchive, deleteArchive } from '../services/archiveService';
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

export default function Archives() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    thumbnail: '', 
    video_url: '', 
    duration_minutes: 0,
    price: 0,
    guest_name: '',
    guest_role: '',
    archived_date: new Date().toISOString().split('T')[0]
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

  useEffect(() => {
    loadArchives();
  }, []);

  async function loadArchives(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchArchives(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des archives.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadArchives(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadArchives(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        duration_minutes: parseInt(form.duration_minutes) || 0,
        price: parseFloat(form.price) || 0,
        archived_date: new Date(form.archived_date).toISOString()
      };
      
      if (editId) {
        await updateArchive(editId, payload);
        setSuccess('Archive modifiée avec succès.');
      } else {
        await createArchive(payload);
        setSuccess('Archive créée avec succès.');
      }
      handleCloseDrawer();
      loadArchives();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    
    const id = itemToDelete.id || itemToDelete._id;
    try {
      await deleteArchive(id);
      setSuccess('Archive supprimée.');
      loadArchives();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(item) {
    setForm({ 
      title: item.title || '', 
      description: item.description || '',
      category: item.category || '',
      thumbnail: item.thumbnail || '',
      video_url: item.video_url || '',
      duration_minutes: item.duration_minutes || 0,
      price: item.price || 0,
      guest_name: item.guest_name || '',
      guest_role: item.guest_role || '',
      archived_date: item.archived_date ? new Date(item.archived_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditId(item.id || item._id);
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
      category: '', 
      thumbnail: '', 
      video_url: '', 
      duration_minutes: 0,
      price: 0,
      guest_name: '',
      guest_role: '',
      archived_date: new Date().toISOString().split('T')[0]
    });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { 
      key: 'duration_minutes', 
      label: 'Durée',
      render: (item) => `${item.duration_minutes || 0} min`
    },
    { 
      key: 'price', 
      label: 'Prix',
      render: (item) => {
        const price = Number(item.price) || 0;
        return `${price.toLocaleString()} FCFA`;
      }
    },
    { 
      key: 'views', 
      label: 'Vues',
      render: (item) => item.views || 0
    },
    { 
      key: 'purchases_count', 
      label: 'Achats',
      render: (item) => item.purchases_count || 0
    }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Archives Vidéo"
        description="Gérer les archives vidéo premium"
        action={
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            variant="primary"
            disabled={submitting}
          >
            + Nouvelle Archive
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
                Charger plus d'archives ({items.length}/{totalItems})
              </>
            )}
          </button>
        </div>
      )}

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? '✏️ Modifier l\'Archive' : '➕ Nouvelle Archive'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>💎 Archives Premium :</strong> Les archives sont des contenus vidéo premium accessibles uniquement aux abonnés ou via achat individuel.
            </p>
          </div>

          <FormInput
            label="Titre"
            placeholder="Titre de l'archive"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />

          <FormTextarea
            label="Description"
            placeholder="Description détaillée"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            rows={4}
            required
          />

          <FormInput
            label="Catégorie"
            placeholder="Ex: Émission, Documentaire, Reportage"
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
            required
          />

          <ImageUpload
            label="Miniature"
            value={form.thumbnail}
            onChange={(url) => setForm({...form, thumbnail: url})}
            helperText="URL de l'image de couverture"
          />

          <FormInput
            label="URL Vidéo"
            placeholder="https://..."
            value={form.video_url}
            onChange={e => setForm({...form, video_url: e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Durée (minutes)"
              type="number"
              placeholder="60"
              value={form.duration_minutes}
              onChange={e => setForm({...form, duration_minutes: e.target.value})}
              min="0"
              required
            />

            <FormInput
              label="Prix (FCFA)"
              type="number"
              placeholder="1000"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              min="0"
              helperText="Prix pour achat individuel"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nom de l'invité"
              placeholder="Nom de l'invité"
              value={form.guest_name}
              onChange={e => setForm({...form, guest_name: e.target.value})}
              required
            />

            <FormInput
              label="Rôle de l'invité"
              placeholder="Ex: Expert, Consultant, Spécialiste"
              value={form.guest_role}
              onChange={e => setForm({...form, guest_role: e.target.value})}
              required
            />
          </div>

          <FormInput
            label="Date d'archivage"
            type="date"
            value={form.archived_date}
            onChange={e => setForm({...form, archived_date: e.target.value})}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Enregistrement...' : (editId ? 'Modifier' : 'Créer')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseDrawer} disabled={submitting}>
              Annuler
            </Button>
          </div>
        </form>
      </Drawer>

      {loading ? (
        <Loader size="lg" text="Chargement des archives..." />
      ) : items.length === 0 ? (
        <EmptyState 
          icon="📹"
          title="Aucune archive"
          message="Créez votre première archive pour la voir apparaître ici."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns}
            data={items}
            actions={actions}
          />
          
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

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer l'Archive"
        message={`Êtes-vous sûr de vouloir supprimer l'archive "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
