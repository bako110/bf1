import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminLogin from './screens/AdminLogin';
import UsersScreen from './screens/UsersScreen';
import NewsScreen from './screens/NewsScreen';
import ShowsScreen from './screens/ShowsScreen';
import MoviesScreen from './screens/MoviesScreen';
import CommentsScreen from './screens/CommentsScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import Messages from './components/Messages';
import Dashboard from './components/Dashboard';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState('dashboard');

  if (!isAdmin) {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  return (
    <div className="flex">
      <Sidebar currentSection={section} onSectionChange={setSection} />
      <div className="ml-64 w-full">
        <Header onLogout={() => setIsAdmin(false)} onSectionChange={setSection} />
        <main className="mt-16">
          {section === 'dashboard' && <Dashboard />}
          {section === 'users' && <UsersScreen />}
          {section === 'messages' && <Messages />}
          {section === 'news' && <NewsScreen />}
          {section === 'shows' && <ShowsScreen />}
          {section === 'movies' && <MoviesScreen />}
          {section === 'comments' && <CommentsScreen />}
          {section === 'subscriptions' && <SubscriptionsScreen />}
          {section === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;
