import React, { useEffect, useState } from 'react';
import { fetchPrograms, createProgram, updateProgram, deleteProgram } from '../services/programService';
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

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    channel_id: '',
    title: '',
    description: '',
    type: '',
    category: '',
    start_time: '',
    end_time: '',
    image_url: '',
    host: ''
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPrograms();
      setPrograms(data);
    } catch (e) {
      setError('Erreur lors du chargement des programmes EPG.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateProgram(editId, form);
        setSuccess('Programme modifié avec succès.');
      } else {
        await createProgram(form);
        setSuccess('Programme créé avec succès.');
      }
      handleClose();
      loadPrograms();
    } catch (e) {
      setError('Erreur lors de la sauvegarde: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const id = item.id || item._id;
    setError('');
    setSuccess('');
    if (window.confirm('Supprimer ce programme ?')) {
      try {
        await deleteProgram(id);
        setSuccess('Programme supprimé.');
        loadPrograms();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(program) {
    setForm({
      channel_id: program.channel_id || '',
      title: program.title || '',
      description: program.description || '',
      type: program.type || '',
      category: program.category || '',
      start_time: program.start_time ? new Date(program.start_time).toISOString().slice(0, 16) : '',
      end_time: program.end_time ? new Date(program.end_time).toISOString().slice(0, 16) : '',
      image_url: program.image_url || '',
      host: program.host || ''
    });
    setEditId(program.id || program._id);
    setIsDrawerOpen(true);
    setError('');
    setSuccess('');
  }

  function handleClose() {
    setIsDrawerOpen(false);
    setEditId(null);
    setForm({
      channel_id: '',
      title: '',
      description: '',
      type: '',
      category: '',
      start_time: '',
      end_time: '',
      image_url: '',
      host: ''
    });
    setError('');
  }

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'type', label: 'Type' },
    { 
      key: 'start_time', 
      label: 'Début',
      render: (val) => val ? new Date(val).toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '-'
    },
    { 
      key: 'end_time', 
      label: 'Fin',
      render: (val) => val ? new Date(val).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '-'
    },
    { key: 'host', label: 'Présentateur' }
  ];

  const actions = [
    { label: 'Modifier', onClick: handleEdit, className: 'text-blue-600 hover:text-blue-800 font-medium text-sm' },
    { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="📅 Guide des Programmes (EPG)"
          description="Gérer la grille des programmes TV - Electronic Program Guide"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
              disabled={submitting}
            >
              + Nouveau Programme
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? '✏️ Modifier le Programme' : '➕ Nouveau Programme'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Remplissez tous les champs pour créer un programme EPG complet.
              </p>
            </div>

            <FormInput
              label="ID de la Chaîne"
              placeholder="ID de la chaîne (ex: 507f1f77bcf86cd799439011)"
              value={form.channel_id}
              onChange={e => setForm({...form, channel_id: e.target.value})}
              helperText="L'identifiant de la chaîne TV associée"
            />

            <FormInput
              label="Titre du Programme"
              placeholder="Journal du Matin"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormInput
              label="Type"
              placeholder="Actualités, Sport, Culture, Politique..."
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              required
            />

            <FormInput
              label="Catégorie"
              placeholder="Journal, Magazine, Débat..."
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Heure de Début"
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm({...form, start_time: e.target.value})}
                required
              />

              <FormInput
                label="Heure de Fin"
                type="datetime-local"
                value={form.end_time}
                onChange={e => setForm({...form, end_time: e.target.value})}
                required
              />
            </div>

            <ImageUpload
              label="Image du Programme"
              value={form.image_url}
              onChange={(url) => setForm({...form, image_url: url})}
              disabled={submitting}
              helperText="Sélectionnez une image pour le programme"
            />

            <FormInput
              label="Présentateur/Animateur"
              placeholder="Marie Diallo"
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
            />

            <FormTextarea
              label="Description"
              placeholder="Description détaillée du programme..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
            />

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
                  editId ? '💾 Mettre à jour' : '✨ Créer'
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
          <Loader size="lg" text="Chargement des programmes EPG..." />
        ) : programs.length === 0 ? (
          <EmptyState 
            icon="📅"
            title="Aucun programme"
            message="Créez votre premier programme EPG pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <DataTable 
              columns={columns}
              data={programs}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
