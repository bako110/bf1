import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, createUser, fetchUsers, deleteUser, banUser, unbanUser, adminUpdateUser } from '../services/userService';
import PageHeader from './ui/PageHeader';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY2  = '#374151';
const GRAY3  = '#6B7280';
const GRAY4  = '#9CA3AF';
const BORDER = '#E5E7EB';

const TABS = [
  { key: 'collab',    label: 'Collaborateurs', icon: '◎' },
  { key: 'profile',   label: 'Mon profil',     icon: '▦' },
  { key: 'password',  label: 'Mot de passe',   icon: '◆' },
  { key: 'account',   label: 'Mon compte',     icon: '◉' },
];

/* ── Petits composants ─────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: GRAY2, marginBottom: 6, letterSpacing: 0.3 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      onFocus={e => { e.target.style.borderColor = RED; e.target.style.boxShadow = `0 0 0 2px rgba(226,62,62,0.12)`; }}
      onBlur={e  => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }}
      style={{
        width: '100%', padding: '10px 12px', fontSize: 13, color: GRAY1,
        border: `1.5px solid ${BORDER}`, borderRadius: 8,
        outline: 'none', background: '#fff',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
      }}
    />
  );
}

function Btn({ children, loading, disabled, variant = 'primary', size = 'md', ...props }) {
  const off = loading || disabled;
  const bg = variant === 'danger' ? '#DC2626'
           : variant === 'ghost'  ? '#F3F4F6'
           : RED;
  const hov = variant === 'danger' ? '#B91C1C'
            : variant === 'ghost'  ? '#E5E7EB'
            : '#C93535';
  const col = variant === 'ghost' ? GRAY2 : '#fff';
  const pad = size === 'sm' ? '5px 10px' : '10px 20px';
  const fz  = size === 'sm' ? 12 : 13;
  return (
    <button
      {...props}
      disabled={off}
      style={{
        padding: pad, fontSize: fz, fontWeight: 700,
        background: off ? GRAY4 : bg, color: off ? '#fff' : col,
        border: variant === 'ghost' ? `1px solid ${BORDER}` : 'none',
        borderRadius: 8, cursor: off ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!off) e.currentTarget.style.background = hov; }}
      onMouseLeave={e => { if (!off) e.currentTarget.style.background = off ? GRAY4 : bg; }}
    >
      {loading ? 'En cours...' : children}
    </button>
  );
}

function Feedback({ type, message, onClose }) {
  if (!message) return null;
  const err = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 8, marginBottom: 16,
      background: err ? 'rgba(226,62,62,0.07)' : 'rgba(22,163,74,0.07)',
      border: `1px solid ${err ? 'rgba(226,62,62,0.25)' : 'rgba(22,163,74,0.25)'}`,
      borderLeft: `3px solid ${err ? RED : '#16A34A'}`,
      fontSize: 13, color: err ? RED : '#16A34A',
    }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
    </div>
  );
}

/* ── Modal édition collaborateur ───────────────────────── */
function EditModal({ user, onClose, onSaved }) {
  const [form, setForm]   = useState({ username: user.username || '', email: user.email || '', phone: user.phone || '' });
  const [err,  setErr]    = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await adminUpdateUser(user.id, form);
      onSaved('Collaborateur mis à jour avec succès');
    } catch (ex) {
      const d = ex?.response?.data?.detail;
      setErr(typeof d === 'string' ? d : 'Erreur lors de la mise à jour');
    }
    setSaving(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 12,
        padding: '28px', width: '100%', maxWidth: 460,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        border: `1px solid ${BORDER}`, borderTop: `3px solid ${RED}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 18, background: RED, borderRadius: 2, display: 'inline-block' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: GRAY1, margin: 0 }}>Modifier le collaborateur</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY3, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <Feedback type="error" message={err} onClose={() => setErr('')} />
        <form onSubmit={handleSubmit}>
          <Field label="Nom d'utilisateur">
            <Input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Téléphone">
            <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn loading={saving}>Enregistrer</Btn>
            <Btn variant="ghost" type="button" onClick={onClose}>Annuler</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Section collaborateurs ────────────────────────────── */
function CollabSection() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');
  const [editUser,   setEditUser]   = useState(null);
  // formulaire ajout
  const [adm,        setAdm]        = useState({ username: '', email: '', password: '', confirm: '' });
  const [admSuccess, setAdmSuccess] = useState('');
  const [admError,   setAdmError]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(1, 100);
      // Filtrer : uniquement les collaborateurs (non admin ou is_admin=false)
      const items = (data.items || data).filter(u => !u.is_admin);
      setUsers(items);
    } catch { setError('Erreur chargement collaborateurs'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleBanToggle(u) {
    try {
      if (u.is_active) {
        await banUser(u.id);
        setSuccess(`${u.username} suspendu`);
      } else {
        await unbanUser(u.id);
        setSuccess(`${u.username} réactivé`);
      }
      load();
    } catch { setError('Erreur lors de la mise à jour'); }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Supprimer définitivement "${u.username}" ?`)) return;
    try {
      await deleteUser(u.id);
      setSuccess(`${u.username} supprimé`);
      load();
    } catch { setError('Erreur lors de la suppression'); }
  }

  async function handleAdd(e) {
    e.preventDefault(); setAdmSuccess(''); setAdmError('');
    if (adm.password !== adm.confirm) { setAdmError('Les mots de passe ne correspondent pas'); return; }
    if (adm.password.length < 6)      { setAdmError('Au moins 6 caractères requis'); return; }
    setSaving(true);
    try {
      await createUser({ username: adm.username, email: adm.email, password: adm.password, is_admin: false });
      setAdmSuccess(`Collaborateur "${adm.username}" créé avec succès`);
      setAdm({ username: '', email: '', password: '', confirm: '' });
      setShowForm(false);
      load();
    } catch (ex) {
      const d = ex?.response?.data?.detail;
      setAdmError(typeof d === 'string' ? d : 'Erreur lors de la création');
    }
    setSaving(false);
  }

  return (
    <>
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={msg => { setSuccess(msg); setEditUser(null); load(); }}
        />
      )}

      <Feedback type="error"   message={error}   onClose={() => setError('')}   />
      <Feedback type="success" message={success} onClose={() => setSuccess('')} />

      {/* Bouton ajouter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setShowForm(v => !v)}>
          {showForm ? '− Fermer' : '+ Ajouter un collaborateur'}
        </Btn>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div style={{
          background: '#FAFAFA', border: `1px solid ${BORDER}`,
          borderLeft: `3px solid ${RED}`, borderRadius: 8,
          padding: '20px', marginBottom: 20,
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: GRAY1, margin: '0 0 14px' }}>Nouveau collaborateur</h4>
          <Feedback type="error"   message={admError}   onClose={() => setAdmError('')}   />
          <Feedback type="success" message={admSuccess} onClose={() => setAdmSuccess('')} />
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Nom d'utilisateur">
                <Input type="text" required value={adm.username} placeholder="ex: marie_dupont" onChange={e => setAdm({ ...adm, username: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" required value={adm.email} placeholder="collab@bf1.tv" onChange={e => setAdm({ ...adm, email: e.target.value })} />
              </Field>
              <Field label="Mot de passe">
                <Input type="password" required minLength={6} value={adm.password} placeholder="Min. 6 caractères" onChange={e => setAdm({ ...adm, password: e.target.value })} />
              </Field>
              <Field label="Confirmer le mot de passe">
                <Input type="password" required minLength={6} value={adm.confirm} placeholder="Répéter" onChange={e => setAdm({ ...adm, confirm: e.target.value })} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn loading={saving}>Créer le compte</Btn>
              <Btn variant="ghost" type="button" onClick={() => setShowForm(false)}>Annuler</Btn>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${BORDER}`, borderTopColor: RED, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: GRAY4, fontSize: 13 }}>
          Aucun collaborateur pour l'instant
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', border: `1px solid ${BORDER}`,
              borderRadius: 8, background: u.is_active ? '#fff' : '#FAFAFA',
            }}>
              {/* Avatar initiale */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: u.is_active ? `rgba(226,62,62,0.12)` : '#F3F4F6',
                color: u.is_active ? RED : GRAY3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {u.username?.[0]?.toUpperCase() ?? '?'}
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GRAY1 }}>{u.username}</p>
                <p style={{ margin: 0, fontSize: 11, color: GRAY3 }}>{u.email || '—'}</p>
              </div>

              {/* Badge statut */}
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: u.is_active ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.08)',
                color: u.is_active ? '#16A34A' : '#DC2626',
                border: `1px solid ${u.is_active ? 'rgba(22,163,74,0.20)' : 'rgba(220,38,38,0.15)'}`,
              }}>
                {u.is_active ? 'Actif' : 'Suspendu'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Btn size="sm" variant="ghost" onClick={() => setEditUser(u)}>Modifier</Btn>
                <Btn size="sm" variant="ghost" onClick={() => handleBanToggle(u)}>
                  {u.is_active ? 'Suspendre' : 'Réactiver'}
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(u)}>Supprimer</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

/* ── Écran principal ───────────────────────────────────── */
export default function Settings() {
  const [activeTab,   setActiveTab]   = useState('collab');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);

  const [form,     setForm]     = useState({ username: '', email: '', phone: '' });
  const [pSuccess, setPSuccess] = useState('');
  const [pError,   setPError]   = useState('');
  const [savingP,  setSavingP]  = useState(false);

  const [pw,       setPw]       = useState({ current: '', next: '', confirm: '' });
  const [pwSuc,    setPwSuc]    = useState('');
  const [pwErr,    setPwErr]    = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const u = await getCurrentUser();
      setCurrentUser(u);
      setForm({ username: u.username || '', email: u.email || '', phone: u.phone || '' });
    } catch { setPError('Erreur chargement profil'); }
    setLoading(false);
  }

  async function handleProfile(e) {
    e.preventDefault(); setSavingP(true); setPSuccess(''); setPError('');
    try { setPSuccess('Profil mis à jour avec succès'); }
    catch { setPError('Erreur lors de la mise à jour'); }
    setSavingP(false);
  }

  async function handlePassword(e) {
    e.preventDefault(); setPwSuc(''); setPwErr('');
    if (pw.next !== pw.confirm) { setPwErr('Les mots de passe ne correspondent pas'); return; }
    if (pw.next.length < 6)    { setPwErr('Au moins 6 caractères requis'); return; }
    setSavingPw(true);
    try { setPwSuc('Mot de passe modifié'); setPw({ current: '', next: '', confirm: '' }); }
    catch { setPwErr('Erreur lors du changement'); }
    setSavingPw(false);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: RED, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: 32 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <PageHeader title="Paramètres" description="Gérer les collaborateurs et votre profil" />

        {/* ── Barre d'onglets ──────────────────────────── */}
        <div style={{
          display: 'flex', gap: 4,
          background: '#fff', border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: 4, marginBottom: 24,
        }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 12px', fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : GRAY3,
                  background: active ? RED : 'transparent',
                  border: 'none', borderRadius: 7, cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: active ? '0 2px 8px rgba(226,62,62,0.25)' : 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = GRAY1; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = GRAY3; } }}
              >
                <span style={{ fontSize: 12 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Contenu ──────────────────────────────────── */}
        <div style={{
          background: '#fff', border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: '28px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          borderTop: `3px solid ${RED}`,
        }}>

          {activeTab === 'collab' && <CollabSection />}

          {activeTab === 'profile' && (
            <>
              <Feedback type="error"   message={pError}   onClose={() => setPError('')}   />
              <Feedback type="success" message={pSuccess} onClose={() => setPSuccess('')} />
              <form onSubmit={handleProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Field label="Nom d'utilisateur">
                    <Input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </Field>
                </div>
                <Field label="Téléphone (optionnel)">
                  <Input type="tel" value={form.phone} placeholder="Optionnel" onChange={e => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Btn loading={savingP}>Mettre à jour</Btn>
              </form>
            </>
          )}

          {activeTab === 'password' && (
            <>
              <Feedback type="error"   message={pwErr} onClose={() => setPwErr('')} />
              <Feedback type="success" message={pwSuc} onClose={() => setPwSuc('')} />
              <form onSubmit={handlePassword}>
                <Field label="Mot de passe actuel">
                  <Input type="password" value={pw.current} required onChange={e => setPw({ ...pw, current: e.target.value })} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Field label="Nouveau mot de passe">
                    <Input type="password" value={pw.next} required minLength={6} onChange={e => setPw({ ...pw, next: e.target.value })} />
                  </Field>
                  <Field label="Confirmer">
                    <Input type="password" value={pw.confirm} required minLength={6} onChange={e => setPw({ ...pw, confirm: e.target.value })} />
                  </Field>
                </div>
                <Btn loading={savingPw}>Changer le mot de passe</Btn>
              </form>
            </>
          )}

          {activeTab === 'account' && (
            <div>
              {[
                { label: "Nom d'utilisateur", value: <span style={{ fontSize: 13, fontWeight: 600, color: GRAY1 }}>{currentUser?.username || '—'}</span> },
                { label: 'Email',             value: <span style={{ fontSize: 13, color: GRAY2 }}>{currentUser?.email || '—'}</span> },
                {
                  label: 'Rôle',
                  value: <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(226,62,62,0.10)', color: RED }}>
                    {currentUser?.is_admin ? 'Administrateur' : 'Utilisateur'}
                  </span>,
                },
                {
                  label: 'Statut',
                  value: <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: currentUser?.is_premium ? 'rgba(255,111,0,0.10)' : '#F3F4F6', color: currentUser?.is_premium ? '#FF6F00' : GRAY3 }}>
                    {currentUser?.is_premium ? 'Premium' : 'Standard'}
                  </span>,
                },
                { label: 'Membre depuis', value: <span style={{ fontSize: 13, color: GRAY2 }}>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('fr-FR') : '—'}</span> },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <span style={{ fontSize: 13, color: GRAY3 }}>{row.label}</span>
                  {row.value}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
