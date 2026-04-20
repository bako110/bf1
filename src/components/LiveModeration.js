import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../config/api';
import PageHeader from './ui/PageHeader';
import Alert from './ui/Alert';
import Loader from './ui/Loader';

function timeAgo(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return "a l'instant";
  if (s < 3600)  return Math.floor(s / 60) + 'min';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return new Date(d).toLocaleDateString('fr-FR');
}

function Avatar({ url, username }) {
  const [err, setErr] = useState(false);
  const letter = (username || '?')[0].toUpperCase();
  if (!url || err) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
        {letter}
      </div>
    );
  }
  return (
    <img
      src={url.startsWith('http') ? url : `${process.env.REACT_APP_API_URL || ''}${url}`}
      alt={username}
      onError={() => setErr(true)}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
    />
  );
}

// ── Onglet Chat temps reel ────────────────────────────────────────────────────

function ChatModerationTab() {
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, msgRes] = await Promise.all([
        api.get('/ws/status'),
        api.get('/ws/chat/messages'),
      ]);
      setChatOpen(msgRes.data.chat_open ?? true);
      setViewers(statusRes.data.livestream_viewers ?? 0);
      setMessages(msgRes.data.messages || []);
    } catch {
      setError('Erreur de chargement de l\'etat du chat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();

    const wsUrl = (process.env.REACT_APP_API_URL || 'https://bf1.fly.dev/api/v1')
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsUrl}/ws`);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      socket.send(JSON.stringify({ type: 'join_livestream', user_id: 'admin' }));
    };
    socket.onclose = () => setWsConnected(false);
    socket.onerror = () => setWsConnected(false);
    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'chat_message') {
          setMessages(prev => [...prev, msg.message].slice(-200));
        } else if (msg.type === 'chat_message_hidden') {
          setMessages(prev => prev.map(m =>
            m.id === msg.message_id ? { ...m, _admin_hidden: true } : m
          ));
        } else if (msg.type === 'chat_message_deleted') {
          setMessages(prev => prev.filter(m => m.id !== msg.message_id));
        } else if (msg.type === 'chat_status') {
          setChatOpen(msg.open);
        } else if (msg.type === 'chat_cleared') {
          setMessages([]);
        } else if (msg.type === 'viewer_joined' || msg.type === 'viewer_left') {
          setViewers(msg.total_viewers ?? 0);
        } else if (msg.type === 'joined_livestream') {
          setViewers(msg.total_viewers ?? 0);
          if (msg.messages) setMessages(msg.messages);
          if (msg.open !== undefined) setChatOpen(msg.open);
        }
      } catch {}
    };

    return () => socket.close();
  }, [loadInitial]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const hideMessage = async (id) => {
    try {
      await api.post(`/ws/chat/hide/${id}`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, _admin_hidden: true } : m));
      setSuccess('Message masque.');
    } catch { setError('Erreur lors du masquage.'); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Supprimer definitivement ce message ?')) return;
    try {
      await api.delete(`/ws/chat/delete/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      setSuccess('Message supprime.');
    } catch { setError('Erreur lors de la suppression.'); }
  };

  const toggleChat = async () => {
    try {
      if (chatOpen) {
        await api.post('/ws/chat/close');
        setChatOpen(false);
        setSuccess('Chat ferme.');
      } else {
        await api.post('/ws/chat/open');
        setChatOpen(true);
        setSuccess('Chat ouvert.');
      }
    } catch { setError('Erreur changement etat du chat.'); }
  };

  const clearAll = async () => {
    if (!window.confirm('Vider TOUT le chat ? Cette action est irreversible.')) return;
    try {
      await api.delete('/ws/chat/clear');
      setMessages([]);
      setSuccess('Chat vide.');
    } catch { setError('Erreur lors du vidage du chat.'); }
  };

  if (loading) return <Loader text="Chargement du chat..." />;

  return (
    <div>
      {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" title="Succes" message={success} onClose={() => setSuccess('')} />}

      {/* Barre statut + actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-medium text-gray-700">
            {wsConnected ? 'WebSocket connecte' : 'WebSocket hors ligne'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          <strong>{viewers}</strong> spectateur{viewers !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-500">
          <strong>{messages.length}</strong> message{messages.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <button
            onClick={toggleChat}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              chatOpen
                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-300'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-300'
            }`}
          >
            {chatOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 transition-colors"
          >
            Vider le chat
          </button>
          <button
            onClick={loadInitial}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            Rafraichir
          </button>
        </div>
      </div>

      {!chatOpen && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg p-3 mb-4 text-sm font-medium">
          Le chat est actuellement ferme — les utilisateurs ne peuvent pas envoyer de messages.
        </div>
      )}

      {/* Liste messages */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Messages du chat live</span>
          <span className="text-xs text-gray-400">Les messages masques restent visibles pour l'admin</span>
        </div>
        <div ref={listRef} className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Aucun message dans le chat.</p>
            </div>
          ) : (
            [...messages].reverse().map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  m._admin_hidden ? 'opacity-50 bg-yellow-50' : ''
                }`}
              >
                <Avatar url={m.avatar_url} username={m.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{m.username || 'Anonyme'}</span>
                    <span className="text-xs text-gray-400">{timeAgo(m.created_at)}</span>
                    {m._admin_hidden && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Masque</span>
                    )}
                    {m.user_id && (
                      <span className="text-xs text-gray-400 font-mono">#{String(m.user_id).slice(-6)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 break-words leading-relaxed">{m.text}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => hideMessage(m.id)}
                    title="Masquer le message"
                    className="px-2 py-1 rounded text-xs font-medium hover:bg-yellow-100 text-yellow-700 border border-yellow-200 transition-colors"
                  >
                    Masquer
                  </button>
                  <button
                    onClick={() => deleteMessage(m.id)}
                    title="Supprimer"
                    className="px-2 py-1 rounded text-xs font-medium hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Onglet Commentaires persistants ──────────────────────────────────────────

function PersistentCommentsTab() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/livestream/comments?skip=0&limit=200');
      setComments(res.data.comments || []);
    } catch {
      setError('Erreur de chargement des commentaires.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleHide = async (comment) => {
    const newHidden = !comment.is_hidden;
    try {
      await api.patch(`/livestream/comments/${comment.id}/moderate`, { is_hidden: newHidden });
      setComments(prev => prev.map(c =>
        c.id === comment.id ? { ...c, is_hidden: newHidden } : c
      ));
      setSuccess(newHidden ? 'Commentaire masque.' : 'Commentaire visible.');
    } catch { setError('Erreur lors de la moderation.'); }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Supprimer definitivement ce commentaire ?')) return;
    try {
      await api.delete(`/livestream/comments/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
      setSuccess('Commentaire supprime.');
    } catch { setError('Erreur lors de la suppression.'); }
  };

  if (loading) return <Loader text="Chargement des commentaires..." />;

  return (
    <div>
      {error && <Alert type="error" title="Erreur" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" title="Succes" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Commentaires persistants ({comments.length})
          </span>
          <button
            onClick={load}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Rafraichir
          </button>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Aucun commentaire persistant pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  c.is_hidden ? 'opacity-50 bg-yellow-50' : ''
                }`}
              >
                <Avatar url={c.avatar_url} username={c.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{c.username || 'Anonyme'}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                    {c.is_hidden && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Masque</span>
                    )}
                    {c.updated_at && (
                      <span className="text-xs text-gray-400 italic">modifie</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 break-words leading-relaxed">{c.text}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleHide(c)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      c.is_hidden
                        ? 'hover:bg-green-100 text-green-700 border-green-200'
                        : 'hover:bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {c.is_hidden ? 'Afficher' : 'Masquer'}
                  </button>
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="px-2 py-1 rounded text-xs font-medium hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function LiveModeration() {
  const [tab, setTab] = useState('chat');

  const tabs = [
    { key: 'chat',     label: 'Chat en direct',     desc: 'Temps reel via WebSocket' },
    { key: 'comments', label: 'Commentaires',        desc: 'Commentaires persistants' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Moderation Live"
          description="Gerez le chat en direct et les commentaires du live BF1"
        />

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold border transition-all text-left ${
                tab === t.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <div>{t.label}</div>
              <div className={`text-xs mt-0.5 font-normal ${tab === t.key ? 'text-gray-300' : 'text-gray-400'}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>

        {tab === 'chat'     && <ChatModerationTab />}
        {tab === 'comments' && <PersistentCommentsTab />}
      </div>
    </div>
  );
}
