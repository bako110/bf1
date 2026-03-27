import React, { useEffect, useState, useCallback } from 'react';
import api from '../config/api';
import Loader from './ui/Loader';
import Alert from './ui/Alert';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

export default function Messages() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [success, setSuccess] = useState('');
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.append('status_filter', statusFilter);
      
      const response = await api.get(`/support/admin/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (e) {
      setError('Erreur lors du chargement des tickets.');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function handleAddResponse() {
    if (!responseText.trim() || !selectedTicket) return;
    
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/responses`, { 
        message: responseText 
      });
      setSuccess('Réponse envoyée avec succès.');
      setResponseText('');
      loadTickets();
      // Refresh selected ticket
      const response = await api.get(`/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(response.data);
    } catch (e) {
      setError('Erreur lors de l\'envoi de la réponse.');
    }
  }

  async function handleUpdateStatus(newStatus) {
    if (!selectedTicket) return;
    
    try {
      await api.put(`/support/tickets/${selectedTicket.id}`, { status: newStatus });
      setSuccess(`Statut mis à jour: ${newStatus}`);
      loadTickets();
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (e) {
      setError('Erreur lors de la mise à jour du statut.');
    }
  }

  async function handleDeleteTicket(ticketId) {
    if (window.confirm('Supprimer ce ticket ?')) {
      try {
        await api.delete(`/support/tickets/${ticketId}`);
        setSuccess('Ticket supprimé.');
        setSelectedTicket(null);
        loadTickets();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Tickets Support"
          description="Gérer les tickets de support des utilisateurs"
        />

        {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" title="Succès" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <Loader size="lg" text="Chargement des tickets..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des tickets */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tickets ({tickets.length})</h3>
                {/* Filtre par statut */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="open">Ouvert</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Aucun ticket
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{ticket.subject}</p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        Catégorie: {ticket.category}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{ticket.message}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Détails du ticket */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {selectedTicket ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-100 border-b border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                      <span className={`text-sm px-3 py-1 rounded-lg font-semibold ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <div><span className="font-semibold">Catégorie:</span> {selectedTicket.category}</div>
                      <div><span className="font-semibold">Créé le:</span> {new Date(selectedTicket.created_at).toLocaleString('fr-FR')}</div>
                      {selectedTicket.updated_at && (
                        <div><span className="font-semibold">Mis à jour:</span> {new Date(selectedTicket.updated_at).toLocaleString('fr-FR')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Message initial */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Message initial</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>

                    {/* Réponses */}
                    {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                      <div className="space-y-4 mb-6">
                        <p className="text-sm font-semibold text-gray-700">Réponses ({selectedTicket.responses.length})</p>
                        {selectedTicket.responses.map((response, index) => (
                          <div 
                            key={index} 
                            className={`p-4 rounded-lg ${
                              response.author === 'admin' 
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {response.author_name} {response.author === 'admin' && '(Admin)'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.created_at).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Zone de réponse */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Ajouter une réponse</p>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Votre réponse..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="mt-3">
                          <Button onClick={handleAddResponse} disabled={!responseText.trim()}>
                            Envoyer la réponse
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-gray-700">Changer le statut:</p>
                      <Button 
                        onClick={() => handleUpdateStatus('open')}
                        variant="secondary"
                        size="sm"
                        disabled={selectedTicket.status === 'open'}
                      >
                        Ouvert
                      </Button>
                      <Button 
                        onClick={() => handleUpdateStatus('in_progress')}
                        variant="secondary"
                        size="sm"
                        disabled={selectedTicket.status === 'in_progress'}
                      >
                        En cours
                      </Button>
                      <Button 
                        onClick={() => handleUpdateStatus('resolved')}
                        variant="secondary"
                        size="sm"
                        disabled={selectedTicket.status === 'resolved'}
                      >
                        Résolu
                      </Button>
                      <Button 
                        onClick={() => handleUpdateStatus('closed')}
                        variant="secondary"
                        size="sm"
                        disabled={selectedTicket.status === 'closed'}
                      >
                        Fermé
                      </Button>
                      <div className="ml-auto">
                        <Button 
                          onClick={() => handleDeleteTicket(selectedTicket.id)}
                          variant="danger"
                          size="sm"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12">
                  <div className="text-center">
                    {tickets.length === 0 ? (
                      <EmptyState 
                        icon="🎫"
                        title="Aucun ticket"
                        message="Aucun ticket de support"
                      />
                    ) : (
                      <>
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <p className="text-gray-500 mt-4">Sélectionnez un ticket pour le gérer</p>
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
