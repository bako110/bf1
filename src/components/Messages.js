import React, { useEffect, useState } from 'react';
import { fetchMessages, markAsRead, deleteMessage } from '../services/messageService';

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

  async function handleDelete(messageId) {
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Messagerie</h2>
          <p className="text-gray-600">Gérer les messages de contact</p>
        </div>

        {success && (
          <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-gray-100 border-l-4 border-black p-4 mb-6 text-gray-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des messages */}
            <div className="lg:col-span-1 bg-white border border-gray-300 overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-300 p-4">
                <h3 className="font-semibold text-black">Messages ({messages.length})</h3>
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
                        selectedMessage?.id === msg.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-black text-sm">{msg.sender_username || msg.receiver_username}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{msg.subject}</p>
                      {!msg.is_read && <span className="inline-block mt-1 px-2 py-1 bg-black text-white text-xs rounded">Non lu</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Détails du message */}
            <div className="lg:col-span-2 bg-white border border-gray-300">
              {selectedMessage ? (
                <div>
                  <div className="bg-gray-100 border-b border-gray-300 p-6">
                    <h3 className="text-xl font-bold text-black mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-semibold">De: {selectedMessage.sender_username}</span>
                      <span>À: {selectedMessage.receiver_username}</span>
                      <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                      {!selectedMessage.is_read && <span className="px-2 py-1 bg-black text-white text-xs rounded">Non lu</span>}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  <div className="border-t border-gray-300 p-6 flex gap-3">
                    {!selectedMessage.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="bg-gray-700 text-white px-6 py-3 font-semibold hover:bg-black transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12 text-center">
                  <div>
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Sélectionnez un message pour le lire</p>
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
