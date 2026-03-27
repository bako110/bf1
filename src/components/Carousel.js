import React, { useState, useEffect } from 'react';
import {
  getCarouselAdmin,
  createCarouselItem,
  updateCarouselItem,
  updateCarouselImage,
  deleteCarouselItem,
} from '../services/carouselService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import ImageUpload from './ui/ImageUpload';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

export default function Carousel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', order: 0, is_active: true });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await getCarouselAdmin();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des slides.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setEditItem(null);
    setForm({ title: '', description: '', image_url: '', order: 0, is_active: true });
    setError('');
    setSuccess('');
    setIsDrawerOpen(true);
  }

  function handleEdit(item) {
    setEditItem(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      order: item.order ?? 0,
      is_active: item.is_active !== false,
    });
    setError('');
    setSuccess('');
    setIsDrawerOpen(true);
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditItem(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
    if (!form.image_url) { setError('Veuillez sélectionner une image.'); return; }

    setSubmitting(true);
    setError('');
    try {
      if (editItem) {
        const id = editItem.id || editItem._id;
        await updateCarouselItem(id, {
          title: form.title,
          description: form.description || null,
          order: Number(form.order),
          is_active: form.is_active,
        });
        if (form.image_url !== editItem.image_url) {
          await updateCarouselImage(id, form.image_url);
        }
        setSuccess('Slide mise à jour avec succès.');
      } else {
        await createCarouselItem({
          title: form.title,
          description: form.description || null,
          image_url: form.image_url,
          order: Number(form.order),
          is_active: form.is_active,
        });
        setSuccess('Slide créée avec succès.');
      }
      handleClose();
      loadItems();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Erreur lors de la sauvegarde.');
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
    setError('');
    try {
      await deleteCarouselItem(id);
      setSuccess('Slide supprimée avec succès.');
      loadItems();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const columns = [
    {
      key: 'image_url',
      label: 'Image',
      render: (val) =>
        val ? (
          <img src={val} alt="slide" className="w-20 h-12 object-cover rounded" />
        ) : (
          <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
            Aucune
          </div>
        ),
    },
    {
      key: 'title',
      label: 'Titre',
      render: (val) => (
        <div className="max-w-xs">
          <p
            className="font-medium text-gray-900"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4',
            }}
          >
            {val || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'order',
      label: 'Ordre',
      render: (val) => <span className="text-sm text-gray-600">{val ?? '-'}</span>,
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {value === false ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Inactif
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Actif
            </>
          )}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Créé le',
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>,
    },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit },
    { label: 'Supprimer', variant: 'danger', onClick: handleDelete },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Carousel – Page d'accueil"
          description="Gérez les slides affichées en bannière principale sur la page d'accueil"
          action={
            <Button onClick={handleOpen} variant="primary">
              + Ajouter une slide
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer
          isOpen={isDrawerOpen}
          onClose={handleClose}
          title={editItem ? 'Modifier la slide' : 'Nouvelle slide'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Carousel :</strong> Ces slides sont affichées en bannière principale sur la page d'accueil.
              </p>
            </div>

            <FormInput
              label="Titre"
              placeholder="Ex : Secrets 2 Vies – RTI2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <FormTextarea
              label="Description"
              placeholder="Courte description affichée sous le titre…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />

            <FormInput
              label="Ordre d'affichage"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <ImageUpload
              label="Image de la slide"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              disabled={submitting}
              helperText="Sélectionnez une image pour la slide (JPG, PNG, WebP — max 5 MB)"
            />

            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Actif (visible sur le site)
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editItem ? 'Modification...' : 'Création...'}
                  </span>
                ) : editItem ? (
                  '💾 Mettre à jour'
                ) : (
                  '✨ Créer'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleClose}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des slides..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon=""
            title="Aucune slide"
            message="Aucune slide n'est disponible. Créez votre première slide pour commencer."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable columns={columns} data={items} actions={actions} />
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
          onConfirm={confirmDelete}
          title="Supprimer la slide"
          message={`Êtes-vous sûr de vouloir supprimer la slide "${itemToDelete?.title}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          type="danger"
        />
      </div>
    </div>
  );
}


