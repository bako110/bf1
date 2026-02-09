import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/userService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';
import Pagination from './ui/Pagination';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
    loadUsers();
  }, []);

  async function loadUsers(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchUsers(page, itemsPerPage);
      if (append) {
        setUsers(prev => [...prev, ...data.items]);
      } else {
        setUsers(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des utilisateurs.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadUsers(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadUsers(currentPage + 1, true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateUser(editId, form);
        setSuccess('Utilisateur modifié avec succès.');
      } else {
        await createUser(form);
        setSuccess('Utilisateur créé avec succès.');
      }
      setForm({ username: '', email: '', password: '' });
      setEditId(null);
      setIsDrawerOpen(false);
      loadUsers();
    } catch (e) {
      setError('Erreur lors de la sauvegarde de l’utilisateur.');
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
      await deleteUser(id);
      setSuccess('Utilisateur supprimé.');
      loadUsers();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(user) {
    setForm({ username: user.username, email: user.email, password: '' });
    setEditId(user.id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({ username: '', email: '', password: '' });
    setError('');
  }

  const columns = [
    { key: 'username', label: 'Nom', render: (val) => String(val || '') },
    { key: 'email', label: 'Email', render: (val) => String(val || '') },
    { 
      key: 'is_premium', 
      label: 'Statut',
      render: (val) => val ? 'Premium' : 'Standard'
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
          title="Gestion des Utilisateurs"
          description="Créer et gérer les comptes utilisateurs de la plateforme"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvel Utilisateur
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {/* Bouton charger plus */}
        {users.length > 0 && currentPage < totalPages && (
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
                  Charger plus d'utilisateurs ({users.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editId ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Nom d'utilisateur"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
            <FormInput
              label="Email"
              placeholder="email@example.com"
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
            <FormInput
              label="Mot de passe"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required={!editId}
              minLength={6}
              helperText={editId ? 'Laissez vide pour ne pas changer' : 'Minimum 6 caractères'}
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
          <Loader size="lg" text="Chargement des utilisateurs..." />
        ) : users.length === 0 ? (
          <EmptyState 
            icon="👥"
            title="Aucun utilisateur"
            message="Créez votre premier utilisateur pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={users}
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
        title="Supprimer l'Utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${itemToDelete?.username}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}

