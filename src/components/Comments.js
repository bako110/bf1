import React, { useEffect, useState } from 'react';
import { fetchComments, deleteComment, moderateComment, adminUpdateComment } from '../services/commentService';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await fetchComments();
      setComments(data);
    } catch (e) {
      setError('Erreur chargement commentaires');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Supprimer ce commentaire ?')) {
      await deleteComment(id);
      loadComments();
    }
  }

  async function handleToggleHidden(c) {
    await moderateComment(c.id, !c.is_hidden);
    loadComments();
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditingText(c.text || c.content || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText('');
  }

  async function saveEdit(c) {
    await adminUpdateComment(c.id, editingText);
    cancelEdit();
    loadComments();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-6">Modération des Commentaires</h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-800">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-4 animate-spin">●</div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contenu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comments.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{c.username || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 text-xs font-semibold ${
                        c.is_hidden ? 'bg-gray-200 text-gray-800' : 'bg-black text-white'
                      }`}>
                        {c.is_hidden ? 'Masqué' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingId === c.id ? (
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
                        />
                      ) : (
                        (c.text || c.content)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        {editingId === c.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(c)}
                              className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-900 transition-colors"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-300 text-black px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-400 transition-colors"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleHidden(c)}
                              className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-black transition-colors"
                            >
                              {c.is_hidden ? 'Afficher' : 'Masquer'}
                            </button>
                            <button
                              onClick={() => startEdit(c)}
                              className="bg-gray-300 text-black px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-400 transition-colors"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-900 transition-colors"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
