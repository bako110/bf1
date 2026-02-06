import React, { useEffect, useState } from 'react';
import { fetchNotifications, markAsRead, deleteNotification } from '../services/notificationService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications();
      setItems(data);
    } catch (e) {
      setError('Erreur lors du chargement des notifications.');
    }
    setLoading(false);
  }

  async function handleMarkAsRead(id) {
    try {
      await markAsRead(id);
      setSuccess('Notification marquée comme lue.');
      loadNotifications();
    } catch (e) {
      setError('Erreur lors de la mise à jour.');
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        await deleteNotification(id);
        setSuccess('Notification supprimée.');
        loadNotifications();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { 
      key: 'message', 
      label: 'Message',
      render: (val) => val && val.length > 50 ? val.substring(0, 50) + '...' : val
    },
    {
      key: 'is_read',
      label: 'Statut',
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${val ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
          {val ? 'Lue' : 'Non lue'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: (item) => item.is_read ? 'Voir' : 'Marquer comme lue',
      onClick: (item) => !item.is_read && handleMarkAsRead(item.id),
      className: (item) => `text-blue-600 hover:text-blue-800 font-medium text-sm ${item.is_read ? 'opacity-50 cursor-default' : ''}`
    },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Notifications"
          description="Gérer les notifications système"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des notifications..." />
        ) : items.length === 0 ? (
          <EmptyState 
            icon="🔔"
            title="Aucune notification"
            message="Aucune notification à afficher pour le moment."
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
