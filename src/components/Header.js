import React, { useState, useEffect } from 'react';
import { countUnreadMessages } from '../services/messageService';
import { getCurrentUser } from '../services/userService';
import { fetchNotifications, markAsRead, getUnreadCount } from '../services/notificationService';
import { logoutAdmin } from '../services/authService';

export default function Header({ onLogout, onSectionChange }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUnreadMessages();
    loadCurrentUser();
    loadNotifications();
  }, []);

  async function loadUnreadMessages() {
    try {
      const data = await countUnreadMessages();
      setUnreadMessages(data.count);
    } catch (error) {
      console.error('Erreur lors du chargement des messages non lus:', error);
    }
  }

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  async function loadNotifications() {
    try {
      const notifs = await fetchNotifications();
      setNotifications(notifs);
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }

  async function handleMarkAsRead(notifId) {
    try {
      await markAsRead(notifId);
      loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  }

  function handleLogout() {
    logoutAdmin();
    if (onLogout) onLogout();
    window.location.reload();
  }

  function getInitials(name) {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  }

  return (
    <header className="bg-white border-b border-gray-300 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Titre de la page */}
        <div>
          <h1 className="text-xl font-bold text-black">Administration BF1</h1>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-4">
          {/* Messages */}
          <div className="relative">
            <button className="relative p-2 hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          !notif.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      >
                        <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleString('fr-FR')}
                        </p>
                        {!notif.is_read && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">Nouveau</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                {currentUser ? getInitials(currentUser.username) : 'A'}
              </div>
              <span className="text-sm font-semibold text-black">
                {currentUser ? currentUser.username : 'Admin'}
              </span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Profil */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg">
                {currentUser && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-black">{currentUser.username}</p>
                    <p className="text-xs text-gray-600">{currentUser.email}</p>
                    {currentUser.is_admin && (
                      <span className="inline-block mt-2 px-2 py-1 bg-black text-white text-xs rounded">
                        Administrateur
                      </span>
                    )}
                    {currentUser.is_premium && (
                      <span className="inline-block mt-2 ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded">
                        Premium
                      </span>
                    )}
                  </div>
                )}
                <div className="p-2">
                  <button 
                    onClick={() => {
                      if (onSectionChange) onSectionChange('settings');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Mon Profil
                  </button>
                  <button 
                    onClick={() => {
                      if (onSectionChange) onSectionChange('settings');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Paramètres
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-black font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
