import React, { useEffect, useState } from 'react';
import { fetchMessages, markAsRead, deleteMessage } from '../services/messageService';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (e) {
      setError('Erreur lors du chargement des messages.');
    }
    setLoading(false);
  }

  async function handleMarkAsRead(messageId) {
    try {
      await markAsRead(messageId);
      loadMessages();
    } catch (e) {
      setError('Erreur lors du marquage du message.');
    }
  }

  async function handleDelete(item) {
    const messageId = item.id || item._id;
    if (window.confirm('Supprimer ce message ?')) {
      try {
        await deleteMessage(messageId);
        setSuccess('Message supprimé.');
        setSelectedMessage(null);
        loadMessages();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Messagerie"
          description="Gérer les messages de contact des utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des messages..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des messages */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">Messages ({messages.length})</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Aucun message
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{msg.sender_username || msg.receiver_username}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                      {!msg.is_read && <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">Non lu</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Détails du message */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {selectedMessage ? (
                <div>
                  <div className="bg-gray-100 border-b border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedMessage.subject}</h3>
                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <div><span className="font-semibold">De:</span> {selectedMessage.sender_username}</div>
                      <div><span className="font-semibold">À:</span> {selectedMessage.receiver_username}</div>
                      <div>{new Date(selectedMessage.created_at).toLocaleString('fr-FR')}</div>
                      {!selectedMessage.is_read && <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded w-fit">Non lu</span>}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  <div className="border-t border-gray-200 p-6 flex gap-3">
                    {!selectedMessage.is_read && (
                      <Button 
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        variant="secondary"
                      >
                        Marquer comme lu
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDelete(selectedMessage.id)}
                      variant="danger"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12">
                  <div className="text-center">
                    {messages.length === 0 ? (
                      <EmptyState 
                        icon="💬"
                        title="Aucun message"
                        message="Aucun message à afficher"
                      />
                    ) : (
                      <>
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mt-4">Sélectionnez un message pour le lire</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
