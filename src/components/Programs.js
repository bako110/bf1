import React, { useEffect, useState } from 'react';
import { fetchPrograms, createProgram, updateProgram, deleteProgram } from '../services/programService';
import { fetchCategories } from '../services/categoryService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import FormSelect from './ui/FormSelect';
import EmptyState from './ui/EmptyState';
import ImageUpload from './ui/ImageUpload';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';
import DetailView from './ui/DetailView';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    start_time: '',
    end_time: '',
    image_url: '',
    host: ''
  });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categories, setCategories] = useState([]);

  // États pour la vue détaillée
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadPrograms();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (e) {
      console.error('Erreur chargement catégories:', e);
    }
  }

  async function loadPrograms(page = 1, append = false) {
    if (!append) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError('');
    try {
      const data = await fetchPrograms(page, itemsPerPage);
      if (append) {
        setPrograms(prev => [...prev, ...data.items]);
      } else {
        setPrograms(data.items || data);
      }
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch (e) {
      setError('Erreur lors du chargement des programmes EPG.');
    }
    setLoading(false);
    setPaginationLoading(false);
  }

  // Handlers de pagination
  const handlePageChange = (page) => {
    loadPrograms(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !paginationLoading) {
      loadPrograms(currentPage + 1, true);
    }
  };

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

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id;
    setError('');
    setSuccess('');
    try {
      await deleteProgram(id);
      setSuccess('Programme supprimé.');
      loadPrograms();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function handleEdit(program) {
    // Fonction pour formater la date en heure locale pour datetime-local input
    const formatDateTimeLocal = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Extraire les composants de date en heure locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setForm({
      title: program.title || '',
      description: program.description || '',
      type: program.type || '',
      start_time: formatDateTimeLocal(program.start_time),
      end_time: formatDateTimeLocal(program.end_time),
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
      title: '',
      description: '',
      type: '',
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

  // Gestionnaire pour afficher les détails au clic sur une ligne
  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetailView(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title=" Guide des Programmes (EPG)"
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

        {/* Bouton charger plus */}
        {programs.length > 0 && currentPage < totalPages && (
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
                  Charger plus de programmes ({programs.length}/{totalItems})
                </>
              )}
            </button>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={handleClose} title={editId ? ' Modifier le Programme' : ' Nouveau Programme'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong> Astuce :</strong> Remplissez tous les champs pour créer un programme EPG complet.
              </p>
            </div>

            <FormInput
              label="Titre du Programme"
              placeholder="Journal du Matin"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />

            <FormSelect
              label="Type"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
              required
              helperText="Sélectionnez un type dans la liste des catégories disponibles"
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
                  editId ? ' Mettre à jour' : ' Créer'
                )}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleClose}
                disabled={submitting}
              >
                 Annuler
              </Button>
            </div>
          </form>
        </Drawer>

        {loading ? (
          <Loader size="lg" text="Chargement des programmes EPG..." />
        ) : programs.length === 0 ? (
          <EmptyState 
            icon=""
            title="Aucun programme"
            message="Créez votre premier programme EPG pour le voir apparaître ici."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <DataTable 
              columns={columns}
              data={programs}
              actions={actions}
              onRowClick={handleRowClick}
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
        title="Supprimer le Programme"
        message={`Êtes-vous sûr de vouloir supprimer le programme "${itemToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Vue détaillée */}
      {showDetailView && selectedItem && (
        <Drawer
          isOpen={showDetailView}
          onClose={() => {
            setShowDetailView(false);
            setSelectedItem(null);
          }}
          title="Détails du programme"
        >
          <DetailView
            title={selectedItem.title}
            data={selectedItem}
            onClose={() => {
              setShowDetailView(false);
              setSelectedItem(null);
            }}
            onEdit={() => {
              setShowDetailView(false);
              handleEdit(selectedItem);
            }}
            onDelete={() => {
              setShowDetailView(false);
              handleDelete(selectedItem);
            }}
            fields={[
              { key: 'image_url', label: 'Image', type: 'image' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'type', label: 'Type' },
              { key: 'host', label: 'Présentateur' },
              { key: 'start_time', label: 'Heure de début' },
              { key: 'end_time', label: 'Heure de fin' },
              { key: 'created_at', label: 'Date de création', type: 'date' },
              { key: 'updated_at', label: 'Dernière modification', type: 'date' }
            ]}
          />
        </Drawer>
      )}
    </div>
  );
}
