import React, { useEffect, useState } from 'react';
import { sendContactMessage, getAboutInfo, fetchContactMessages, deleteContactMessage } from '../services/contactService';
import Drawer from './Drawer';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import FormTextarea from './ui/FormTextarea';
import ConfirmModal from './ui/ConfirmModal';

export default function Contact() {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '', subject: '' });
  const [success, setSuccess] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    loadAboutInfo();
    loadMessages();
  }, []);

  async function loadAboutInfo() {
    setLoading(true);
    setError('');
    try {
      const data = await getAboutInfo();
      setAboutInfo(data);
    } catch (e) {
      setError('Erreur lors du chargement des informations de contact.');
    }
    setLoading(false);
  }

  async function loadMessages() {
    try {
      const data = await fetchContactMessages();
      setMessages(data || []);
    } catch (e) {
      console.error('Erreur chargement messages:', e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await sendContactMessage(form.name, form.email, form.message, form.subject);
      setSuccess('Message envoyé avec succès.');
      setForm({ name: '', email: '', message: '', subject: '' });
      setIsDrawerOpen(false);
      loadMessages();
    } catch (e) {
      setError('Erreur lors de l\'envoi du message.');
    }
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setForm({ name: '', email: '', message: '', subject: '' });
    setError('');
  }

  function handleDelete(message) {
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!messageToDelete) return;
    try {
      await deleteContactMessage(messageToDelete.id);
      setSuccess('Message supprimé.');
      loadMessages();
    } catch (e) {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Gestion des Contacts"
          description="Gérer les informations de contact et envoyer des messages"
          action={
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              variant="primary"
            >
              + Envoyer un Message
            </Button>
          }
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title="Envoyer un Message">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Nom"
              placeholder="Votre nom"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <FormInput
              label="Email"
              placeholder="votre.email@exemple.com"
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
            <FormInput
              label="Sujet"
              placeholder="Sujet du message"
              value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})}
            />
            <FormTextarea
              label="Message"
              placeholder="Votre message..."
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              rows={5}
              required
            />
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                variant="primary"
                fullWidth
              >
                Envoyer
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

        {/* Liste des messages de contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Messages reçus</h3>
            <p className="text-sm text-gray-600 mt-1">Liste des messages de contact envoyés par les utilisateurs</p>
          </div>
          {messages.length > 0 ? (
            <DataTable
              columns={[
                { key: 'name', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'subject', label: 'Sujet', render: (val) => val || '-' },
                { key: 'message', label: 'Message', render: (val) => val.substring(0, 50) + '...' },
                { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString('fr-FR') }
              ]}
              data={messages}
              actions={[
                { label: 'Supprimer', onClick: handleDelete, className: 'text-red-600 hover:text-red-800 font-medium text-sm' }
              ]}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">Aucun message de contact</div>
          )}
        </div>

        {loading ? (
          <Loader size="lg" text="Chargement des informations de contact..." />
        ) : aboutInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">ℹ️</span>
                <h3 className="text-2xl font-bold text-gray-900">À Propos</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Nom</p>
                  <p className="text-lg text-gray-900">{aboutInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{aboutInfo.description}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Site Web</p>
                  <a href={aboutInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium break-all">
                    {aboutInfo.website}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Email Support</p>
                  <a href={`mailto:${aboutInfo.support_email}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {aboutInfo.support_email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🌐</span>
                <h3 className="text-2xl font-bold text-gray-900">Réseaux Sociaux</h3>
              </div>
              {aboutInfo.socials && Object.keys(aboutInfo.socials).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(aboutInfo.socials).map(([platform, url]) => (
                    <div key={platform} className="pb-4 border-b border-gray-100 last:border-b-0">
                      <p className="text-sm font-semibold text-gray-600 mb-2 capitalize">{platform}</p>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium break-all text-sm">
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun réseau social configuré</p>
              )}
            </div>
          </div>
        ) : null}

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Supprimer le message"
          message="Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible."
        />
      </div>
    </div>
  );
}
