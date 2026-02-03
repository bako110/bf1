import React, { useEffect, useState } from 'react';

export default function GenericCRUD({ 
  title, 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem,
  fields,
  columns,
  itemName = 'élément'
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const initialForm = {};
    fields.forEach(field => {
      initialForm[field.name] = '';
    });
    setForm(initialForm);
  }, [fields]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (e) {
      setError(`Erreur lors du chargement des ${itemName}s.`);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await updateItem(editId, form);
        setSuccess(`${itemName} modifié avec succès.`);
      } else {
        await createItem(form);
        setSuccess(`${itemName} créé avec succès.`);
      }
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = '';
      });
      setForm(initialForm);
      setEditId(null);
      loadItems();
    } catch (e) {
      setError(`Erreur lors de la sauvegarde du ${itemName}.`);
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    if (window.confirm(`Supprimer cet ${itemName} ?`)) {
      try {
        await deleteItem(id);
        setSuccess(`${itemName} supprimé.`);
        loadItems();
      } catch (e) {
        setError('Erreur lors de la suppression.');
      }
    }
  }

  function handleEdit(item) {
    const editForm = {};
    fields.forEach(field => {
      editForm[field.name] = item[field.name] || '';
    });
    setForm(editForm);
    setEditId(item.id);
    setError('');
    setSuccess('');
  }

  function handleCancel() {
    const initialForm = {};
    fields.forEach(field => {
      initialForm[field.name] = '';
    });
    setForm(initialForm);
    setEditId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-6">{title}</h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 p-6 mb-6">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(fields.length, 3)} gap-4 mb-4`}>
            {fields.map(field => (
              <div key={field.name}>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    value={form[field.name] || ''}
                    onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                    required={field.required && !editId}
                    rows={field.rows || 3}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none"
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={form[field.name] || ''}
                    onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                    required={field.required && !editId}
                    minLength={field.minLength}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-3 font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors"
            >
              {editId ? 'Modifier' : 'Créer'}
            </button>
            {editId && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="bg-gray-400 text-white px-6 py-3 font-semibold uppercase tracking-wide hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Table */}
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
                  {columns.map(col => (
                    <th key={col.key} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="bg-gray-800 text-white px-4 py-2 text-xs font-semibold uppercase mr-2 hover:bg-gray-700 transition-colors"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-gray-900 transition-colors"
                      >
                        Supprimer
                      </button>
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
