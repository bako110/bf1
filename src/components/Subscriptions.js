import React, { useEffect, useState } from 'react';
import { fetchSubscriptions, cancelSubscription } from '../services/subscriptionService';
import Loader from './ui/Loader';
import PageHeader from './ui/PageHeader';
import DataTable from './ui/DataTable';
import EmptyState from './ui/EmptyState';
import Pagination from './ui/Pagination';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY3  = '#6B7280';
const BORDER = '#E5E7EB';

function Alert({ type, message, onClose }) {
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderRadius: 8, marginBottom: 16,
      background: isErr ? 'rgba(226,62,62,0.07)' : 'rgba(22,163,74,0.07)',
      border: `1px solid ${isErr ? 'rgba(226,62,62,0.25)' : 'rgba(22,163,74,0.25)'}`,
      borderLeft: `3px solid ${isErr ? RED : '#16A34A'}`,
      fontSize: 13, color: isErr ? RED : '#16A34A',
    }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1 }}>×</button>}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: active ? 'rgba(22,163,74,0.10)' : '#F3F4F6',
      color: active ? '#16A34A' : GRAY3,
      border: `1px solid ${active ? 'rgba(22,163,74,0.25)' : BORDER}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#16A34A' : '#9CA3AF', display: 'inline-block' }} />
      {active ? 'Actif' : 'Inactif'}
    </span>
  );
}

export default function Subscriptions() {
  const [subs,              setSubs]              = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [success,           setSuccess]           = useState('');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [totalItems,        setTotalItems]        = useState(0);
  const [totalPages,        setTotalPages]        = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => { loadSubs(); }, []);

  async function loadSubs(page = 1) {
    page === 1 ? setLoading(true) : setPaginationLoading(true);
    setError('');
    try {
      const data = await fetchSubscriptions(page, itemsPerPage);
      setSubs(data.items || data);
      setTotalItems(data.total || data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / itemsPerPage));
      setCurrentPage(page);
    } catch { setError('Erreur chargement abonnements'); }
    setLoading(false);
    setPaginationLoading(false);
  }

  async function handleCancel(id) {
    if (!window.confirm('Annuler cet abonnement ?')) return;
    try {
      await cancelSubscription(id);
      setSuccess('Abonnement annulé avec succès');
      loadSubs(currentPage);
    } catch { setError("Erreur lors de l'annulation"); }
  }

  const columns = [
    { key: 'user_id', label: 'Utilisateur' },
    { key: 'email',   label: 'Email' },
    {
      key: 'is_active', label: 'Statut',
      render: (val) => <StatusBadge active={val} />,
    },
    {
      key: 'start_date', label: 'Début',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '—',
    },
    {
      key: 'end_date', label: 'Fin',
      render: (val) => val ? new Date(val).toLocaleDateString('fr-FR') : '—',
    },
  ];

  const actions = [{
    label: 'Annuler',
    icon: 'trash-2',
    onClick: (item) => item.is_active && handleCancel(item.id),
    className: 'text-red-600',
  }];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader
          title="Abonnements Utilisateurs"
          description="Consulter et gérer les abonnements actifs"
        />

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Résumé */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Total abonnements', value: totalItems,                                    color: RED        },
            { label: 'Actifs',            value: subs.filter(s => s.is_active).length,          color: '#16A34A'  },
            { label: 'Inactifs',          value: subs.filter(s => !s.is_active).length,         color: GRAY3      },
          ].map(c => (
            <div key={c.label} style={{
              background: '#fff', border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: '16px 20px',
              borderLeft: `4px solid ${c.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: GRAY3, fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: GRAY1 }}>{c.value}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Loader size="lg" text="Chargement des abonnements..." />
            </div>
          ) : subs.length === 0 ? (
            <EmptyState icon="" title="Aucun abonnement" message="Aucun abonnement enregistré." />
          ) : (
            <>
              <DataTable columns={columns} data={subs} actions={actions} />
              <Pagination
                currentPage={currentPage} totalPages={totalPages}
                totalItems={totalItems}   itemsPerPage={itemsPerPage}
                onPageChange={loadSubs}
                hasNextPage={currentPage < totalPages}
                hasPrevPage={currentPage > 1}
                loading={paginationLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
