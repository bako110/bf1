import React, { useEffect, useState } from 'react';
import { fetchPushNotifications, createPushNotification, updatePushNotification, deletePushNotification } from '../services/notificationService';
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

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    message: '',
    program_type: 'journal_13h30', // journal_13h30, journal_20h, all_programs
    scheduled_time: '',
    is_active: true,
    target_audience: 'all' // all, premium, free
  });
  const [editId, setEditId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchPushNotifications(page, itemsPerPage);
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des notifications push.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  const handlePageChange = (page) => {
    loadNotifications(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadNotifications(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      if (editId) {
        await updatePushNotification(editId, form);
        setSuccess('Notification push modifiée avec succès.');
      } else {
        await createPushNotification(form);
        setSuccess('Notification push créée avec succès.');
      }
      handleCloseDrawer();
      loadNotifications();
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
      await deletePushNotification(id);
      setSuccess('Notification push supprimée avec succès.');
      loadNotifications();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(notification) {
    setForm({
      title: notification.title || '',
      message: notification.message || '',
      program_type: notification.program_type || 'journal_13h30',
      scheduled_time: notification.scheduled_time || '',
      is_active: notification.is_active !== undefined ? notification.is_active : true,
      target_audience: notification.target_audience || 'all'
    });
    setEditId(notification.id || notification._id);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      title: '',
      message: '',
      program_type: 'journal_13h30',
      scheduled_time: '',
      is_active: true,
      target_audience: 'all'
    });
    setError('');
  }

  function toggleNotificationStatus(notification) {
    const updatedNotification = {
      ...notification,
      is_active: !notification.is_active
    };
    handleEdit(updatedNotification);
    handleSubmit(new Event('submit'));
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { 
      key: 'message', 
      label: 'Message',
      render: (val) => {
        const str = String(val || '');
        return str.length > 50 ? str.substring(0, 50) + '...' : str;
      }
    },
    { 
      key: 'program_type', 
      label: 'Programme',
      render: (val) => {
        const types = {
          'journal_13h30': '📰 Journal 13H30',
          'journal_20h': '📺 Journal 20H',
          'all_programs': '📱 Tous les programmes'
        };
        return types[val] || val;
      }
    },
    { 
      key: 'scheduled_time', 
      label: 'Heure programmée',
      render: (val) => val ? new Date(val).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    { 
      key: 'target_audience', 
      label: 'Audience',
      render: (val) => {
        const audiences = {
          'all': '🌍 Tous',
          'premium': '💎 Premium',
          'free': '🆓 Gratuit'
        };
        return audiences[val] || val;
      }
    },
    { 
      key: 'is_active', 
      label: 'Statut',
      render: (val) => val ? '✅ Active' : '❌ Inactive'
    },
    { 
      key: 'created_at', 
      label: 'Créée le',
      render: (val) => new Date(val).toLocaleDateString('fr-FR')
    }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { 
      label: notification => notification.is_active ? 'Désactiver' : 'Activer', 
      onClick: toggleNotificationStatus, 
      className: notification => notification.is_active ? 'text-orange-600 hover:text-orange-800 font-medium text-sm' : 'text-green-600 hover:text-green-800 font-medium text-sm'
    },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="📱 Notifications Push Mobile"
          description="Gérer les notifications push pour les journaux et programmes mobiles"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvelle Notification
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paginationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>
                  Charger plus de notifications ({items.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? '✏️ Modifier la Notification' : '📱 Nouvelle Notification Push'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📱 Astuce :</strong> Configurez les notifications push pour les journaux de 13H30 et 20H, ou pour tous les programmes mobiles.
              </p>
            </div>

            <FormInput
              label="Titre de la Notification"
              placeholder="📰 Journal 13H30 disponible !"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormTextarea
              label="Message de la Notification"
              placeholder="Ne manquez pas le journal de 13H30 avec toute l'actualité de la journée..."
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              rows={3}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type de Programme <span className="text-red-500">*</span>
              </label>
              <select
                value={form.program_type}
                onChange={e => setForm({...form, program_type: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                required
              >
                <option value="journal_13h30">📰 Journal 13H30</option>
                <option value="journal_20h">📺 Journal 20H</option>
                <option value="all_programs">📱 Tous les programmes</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Heure Programmée"
                type="time"
                value={form.scheduled_time}
                onChange={e => setForm({...form, scheduled_time: e.target.value})}
                helperText="Heure d'envoi automatique"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Audience Cible <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.target_audience}
                  onChange={e => setForm({...form, target_audience: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  required
                >
                  <option value="all">🌍 Tous les utilisateurs</option>
                  <option value="premium">💎 Utilisateurs Premium</option>
                  <option value="free">🆓 Utilisateurs Gratuits</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input 
                type="checkbox" 
                id="is_active"
                checked={form.is_active} 
                onChange={e => setForm({...form, is_active: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">� Activer cette notification push</label>
            </div>

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
                  editId ? '💾 Mettre à jour' : '📱 Créer la Notification'
                )}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleCloseDrawer}
                disabled={submitting}
              >
                ❌ Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des notifications push..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="📱"
            title="Aucune notification push"
            message="Créez votre première notification push pour les journaux mobiles."
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
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer la Notification"
        message={`Êtes-vous sûr de vouloir supprimer la notification "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
