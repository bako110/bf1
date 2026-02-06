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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError('Erreur lors du chargement des utilisateurs.');
    }
    setLoading(false);
  }

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

  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await deleteUser(id);
        setSuccess('Utilisateur supprimé.');
        loadUsers();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
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
    { key: 'username', label: 'Nom' },
    { key: 'email', label: 'Email' },
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
          </div>
        )}
      </div>
    </div>
  );
}

