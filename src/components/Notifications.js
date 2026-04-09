import React, { useEffect, useState } from 'react';
import api from '../config/api';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';

const CATEGORIES = [
  { value: 'info',    label: 'Information generale' },
  { value: 'promo',   label: 'Promotion / Offre' },
  { value: 'news',    label: 'Actualite' },
  { value: 'program', label: 'Programme TV' },
  { value: 'admin',   label: 'Message Admin' },
];

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', message: '', category: 'info' });
  const [editItem, setEditItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications(page = 1, append = false) {
    if (!append) setLoading(true);
    else setPaginationLoading(true);
    setError('');
    try {
      const res = await api.get(`/notifications/admin/all?page=${page}&limit=${itemsPerPage}`);
      const data = res.data;
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || []);
      }
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (e) {
      setError("Erreur lors du chargement des notifications.");
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  const handlePageChange = (page) => loadNotifications(page);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadNotifications(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError('Le titre et le message sont obligatoires.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editItem) {
        await api.put('/notifications/admin/update', {
          id: editItem.id,
          title: form.title.trim(),
          message: form.message.trim(),
          category: form.category,
        });
        setSuccess('Notification modifiee avec succes.');
      } else {
        const res = await api.post('/notifications/admin/global', {
          title: form.title.trim(),
          message: form.message.trim(),
          category: form.category,
        });
        const count = res.data?.sent_to ?? 0;
        setSuccess(`Notification envoyee a ${count} utilisateur${count > 1 ? 's' : ''}.`);
      }
      handleClose();
      loadNotifications();
    } catch (e) {
      setError("Erreur : " + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item) {
    setForm({
      title: item.title || '',
      message: item.message || '',
      category: item.category || 'info',
    });
    setEditItem(item);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  function handleBulkDelete() {
    setItemToDelete(null);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    const idsToDelete = itemToDelete ? [itemToDelete.id] : selectedIds;
    if (!idsToDelete.length) return;
    try {
      await api.post('/notifications/admin/delete-batch', { ids: idsToDelete });
      const count = idsToDelete.length;
      setSuccess(`${count} notification${count > 1 ? 's supprimees' : ' supprimee'}.`);
      setSelectedIds([]);
      loadNotifications();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditItem(null);
    setForm({ title: '', message: '', category: 'info' });
    setError('');
  }

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (val) => (
        <span className="font-medium text-gray-900">{val || '-'}</span>
      )
    },
    {
      key: 'message',
      label: 'Message',
      render: (val) => {
        const str = String(val || '');
        return str.length > 60 ? str.substring(0, 60) + '...' : str;
      }
    },
    {
      key: 'category',
      label: 'Categorie',
      render: (val) => {
        const cat = CATEGORIES.find(c => c.value === val);
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {cat ? cat.label : val}
          </span>
        );
      }
    },
    {
      key: 'recipients',
      label: 'Destinataires',
      render: (val) => (
        <span className="font-semibold text-gray-900">{val || 0}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
    },
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Notifications Push"
          description="Envoyer et gerer les notifications aux utilisateurs"
          action={
            <Button onClick={() => setIsDrawerOpen(true)} variant="primary">
              + Nouvelle Notification
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succes" message={success} onClose={() => setSuccess('')} />}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm font-medium text-red-800">
              {selectedIds.length} notification{selectedIds.length > 1 ? 's' : ''} selectionnee{selectedIds.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer la selection
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {items.length > 0 && currentPage < totalPages && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleLoadMore}
              disabled={paginationLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paginationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>Charger plus ({items.length}/{totalItems})</>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editItem ? 'Modifier la Notification' : 'Nouvelle Notification'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> {editItem ? 'La modification sera appliquee a toutes les copies.' : 'La notification sera envoyee a tous les utilisateurs.'}
              </p>
            </div>

            <FormInput
              label="Titre"
              placeholder="ex: Nouvelle emission disponible"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />

            <FormTextarea
              label="Message"
              placeholder="Contenu de la notification..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={4}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Categorie</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                {submitting ? 'Envoi...' : editItem ? 'Modifier' : 'Envoyer a tous'}
              </Button>
              <Button type="button" variant="ghost" fullWidth onClick={handleClose} disabled={submitting}>
                Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des notifications..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucune notification"
            message="Envoyez votre premiere notification aux utilisateurs."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={items}
              actions={actions}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={confirmDelete}
        title="Supprimer la Notification"
        message={itemToDelete
          ? `Supprimer "${itemToDelete.title}" ?`
          : `Supprimer ${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''} ?`
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}