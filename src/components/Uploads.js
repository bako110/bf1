import React, { useEffect, useState } from 'react';
import { uploadImage, uploadVideo, getUploadHistory } from '../services/uploadsService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';

export default function Uploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadUploads();
  }, []);

  async function loadUploads() {
    setLoading(true);
    setError('');
    try {
      const data = await getUploadHistory();
      setUploads(data);
    } catch (e) {
      setError('Erreur lors du chargement de l\'historique.');
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Sélectionnez un fichier.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      if (uploadType === 'image') {
        await uploadImage(selectedFile);
      } else {
        await uploadVideo(selectedFile);
      }
      setSuccess('Fichier uploadé avec succès.');
      setSelectedFile(null);
      setIsDrawerOpen(false);
      loadUploads();
    } catch (e) {
      setError('Erreur lors de l\'upload du fichier.');
    }
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setSelectedFile(null);
    setUploadType('image');
    setError('');
  }

  const columns = [
    { key: 'filename', label: 'Nom du fichier', render: (val, row) => val || row.name },
    { key: 'file_type', label: 'Type', render: (val) => String(val || '') },
    { 
      key: 'created_at', 
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '-'
    },
    {
      key: 'url',
      label: 'Fichier',
      render: (val, row) => (
        <a 
          href={val || row.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Consulter
        </a>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Uploads"
          description="Gérer et consulter vos fichiers uploadés"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Nouvel Upload
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title="Uploader un Fichier">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Type de fichier</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: uploadType === 'image' ? '#3b82f6' : '#e5e7eb', backgroundColor: uploadType === 'image' ? '#eff6ff' : '#f9fafb' }}>
                  <input 
                    type="radio" 
                    value="image" 
                    checked={uploadType === 'image'} 
                    onChange={e => setUploadType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">🖼️ Image</span>
                </label>
                <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: uploadType === 'video' ? '#3b82f6' : '#e5e7eb', backgroundColor: uploadType === 'video' ? '#eff6ff' : '#f9fafb' }}>
                  <input 
                    type="radio" 
                    value="video" 
                    checked={uploadType === 'video'} 
                    onChange={e => setUploadType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">🎬 Vidéo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Sélectionner un fichier</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all">
                <input 
                  type="file" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div>
                  <p className="text-3xl mb-2">{uploadType === 'image' ? '🖼️' : '🎬'}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner ou glissez-déposez'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadType === 'image' ? 'JPG, PNG, GIF (max 10MB)' : 'MP4, AVI, MOV (max 100MB)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
              >
                Uploader
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
          <Loader size="lg" text="Chargement de l'historique des uploads..." />
        ) : uploads.length === 0 ? (
          <EmptyState 
            icon="📁"
            title="Aucun fichier uploadé"
            message="Commencez par uploader votre premier fichier."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              columns={columns}
              data={uploads}
            />
          </div>
        )}
      </div>
    </div>
  );
}
