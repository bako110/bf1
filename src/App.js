import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminLogin from './screens/AdminLogin';
import UsersScreen from './screens/UsersScreen';
import ShowsScreen from './screens/ShowsScreen';
import MoviesScreen from './screens/MoviesScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import Messages from './components/Messages';
import Dashboard from './components/Dashboard';
import SettingsScreen from './screens/SettingsScreen';
import { logoutAdmin } from './services/authService';

// Imports existants


// Nouveaux imports
import BreakingNews from './components/BreakingNews';
import Comments from './components/Comments';
import Divertissements from './components/Divertissements';
import Reels from './components/Reels';
import Reportages from './components/Reportages';
import JTandMag from './components/JTandMag';
import Favorites from './components/Favorites';
// import Notifications from './components/Notifications';
import Likes from './components/Likes';
import Payments from './components/Payments';
import Contact from './components/Contact';
// import Premium from './components/Premium';
// import Uploads from './components/Uploads';
import Programs from './components/Programs';
import SubscriptionPlans from './components/SubscriptionPlans';
import Archives from './components/Archives';
import LiveControlScreen from './screens/LiveControlScreen';
import Categories from './components/Categories';
import Sports from './components/Sports';

function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [section, setSection] = useState(() => {
    return localStorage.getItem('currentSection') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('currentSection', section);
  }, [section]);

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('currentSection');
    logoutAdmin(); // Supprime aussi le token
  };

  if (!isAdmin) {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentSection={section} onSectionChange={setSection} onLogout={handleLogout} />
      <div className="flex-1 ml-64">
        <Header onLogout={handleLogout} onSectionChange={setSection} />
        <main className="mt-16 p-6">
          {section === 'dashboard' && <Dashboard />}
          {section === 'users' && <UsersScreen />}
          {section === 'shows' && <ShowsScreen />}
          {section === 'breakingNews' && <BreakingNews />}
          {section === 'movies' && <MoviesScreen />}
          {section === 'messages' && <Messages />}
          {section === 'reportage' && <Reportages />}
          {/* {section === 'popularPrograms' && <PopularPrograms />} */}
          {section === 'reel' && <Reels />}
          {section === 'divertissement' && <Divertissements />}
          {section === 'jtandmag' && <JTandMag />}
          {section === 'subscriptions' && <SubscriptionsScreen />}
          {section === 'favorites' && <Favorites />}
          {section === 'comments' && <Comments />}
          {/* {section === 'notifications' && <Notifications />} */}
          {section === 'likes' && <Likes />}
          {section === 'payments' && <Payments />}
          {section === 'contact' && <Contact />}
          {section === 'programs' && <Programs />}
          {section === 'categories' && <Categories />}
          {section === 'subscriptionPlans' && <SubscriptionPlans />}
          {section === 'archives' && <Archives />}
          {section === 'liveControl' && <LiveControlScreen />}
          {section === 'sports' && <Sports />}
          {/* {section === 'premium' && <Premium />} */}
          {/* {section === 'uploads' && <Uploads />} */}
          {section === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;