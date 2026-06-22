import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/userService';
import { fetchNotifications, markAsRead, getUnreadCount } from '../services/notificationService';

const RED    = '#E23E3E';
const GRAY1  = '#111827';
const GRAY2  = '#374151';
const GRAY3  = '#6B7280';
const GRAY4  = '#9CA3AF';
const BORDER = '#E5E7EB';
const BG     = '#FFFFFF';

/* ─ icône cloche ─────────────────────────────── */
function BellIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  );
}

/* ─ icône chevron ────────────────────────────── */
function ChevronIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  );
}

export default function Header({ onLogout, onSectionChange }) {
  const [notifications,      setNotifications]      = useState([]);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [showProfile,        setShowProfile]        = useState(false);
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [currentUser,        setCurrentUser]        = useState(null);

  useEffect(() => { loadCurrentUser(); loadNotifications(); }, []);

  async function loadCurrentUser() {
    try { setCurrentUser(await getCurrentUser()); }
    catch (e) { console.error(e); }
  }

  async function loadNotifications() {
    try {
      setNotifications(await fetchNotifications());
      setUnreadCount(await getUnreadCount());
    } catch (e) { console.error(e); }
  }

  async function handleMarkAsRead(id) {
    try { await markAsRead(id); loadNotifications(); }
    catch (e) { console.error(e); }
  }

  const initials = currentUser?.username?.charAt(0).toUpperCase() ?? 'A';

  return (
    <header style={{
      background: BG,
      borderBottom: `1px solid ${BORDER}`,
      height: 64,
      position: 'fixed', top: 0, right: 0, left: 256,
      zIndex: 40,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>

      {/* ── Titre ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="BF1" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: GRAY1, margin: 0, lineHeight: 1 }}>
            Administration
          </h1>
          <p style={{ fontSize: 11, color: GRAY3, margin: 0 }}>Tableau de bord</p>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
            style={{
              position: 'relative', padding: 8, borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: GRAY3, display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = GRAY1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = GRAY3; }}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: RED, color: '#fff',
                fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #fff',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 48,
              width: 320, background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: GRAY1 }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    background: `rgba(226,62,62,0.10)`, color: RED,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  }}>{unreadCount} nouvelles</span>
                )}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: GRAY4, fontSize: 13 }}>
                    Aucune notification
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                    style={{
                      padding: '10px 16px',
                      borderBottom: `1px solid ${BORDER}`,
                      background: n.is_read ? 'transparent' : 'rgba(226,62,62,0.04)',
                      cursor: n.is_read ? 'default' : 'pointer',
                    }}
                  >
                    <p style={{ fontSize: 13, color: GRAY1, fontWeight: n.is_read ? 400 : 600, margin: 0 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: GRAY4, margin: '3px 0 0' }}>
                      {new Date(n.created_at).toLocaleString('fr-FR')}
                    </p>
                    {!n.is_read && (
                      <span style={{
                        display: 'inline-block', marginTop: 4,
                        padding: '1px 6px', background: RED, color: '#fff',
                        fontSize: 10, fontWeight: 700, borderRadius: 4,
                      }}>Nouveau</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <span style={{ width: 1, height: 28, background: BORDER, display: 'inline-block' }} />

        {/* Profil */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: RED, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: GRAY1 }}>
              {currentUser?.username ?? 'Admin'}
            </span>
            <span style={{ color: GRAY4 }}><ChevronIcon /></span>
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', right: 0, top: 48,
              width: 220, background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {currentUser && (
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: RED, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, flexShrink: 0,
                    }}>{initials}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: GRAY1, margin: 0 }}>{currentUser.username}</p>
                      <p style={{ fontSize: 11, color: GRAY4, margin: 0 }}>{currentUser.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {currentUser.is_admin && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: `rgba(226,62,62,0.10)`, color: RED,
                        fontSize: 10, fontWeight: 700,
                      }}>Administrateur</span>
                    )}
                    {currentUser.is_premium && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(255,111,0,0.10)', color: '#FF6F00',
                        fontSize: 10, fontWeight: 700,
                      }}>Premium</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
