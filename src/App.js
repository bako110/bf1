import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminLogin from './screens/AdminLogin';
import UsersScreen from './screens/UsersScreen';
// import ShowsScreen from './screens/ShowsScreen';
// import MoviesScreen from './screens/MoviesScreen';
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
import Magazine from './components/Magazine';
import Favorites from './components/Favorites';
import Notifications from './components/Notifications';
import Likes from './components/Likes';
import Payments from './components/Payments';
import Contact from './components/Contact';
// import Premium from './components/Premium';
// import Uploads from './components/Uploads';
import Programs from './components/Programs';
import SubscriptionPlans from './components/SubscriptionPlans';
import Archives from './components/Archives';
import LiveControlScreen from './screens/LiveControlScreen';
import LiveModeration from './components/LiveModeration';
import Categories from './components/Categories';
import Sports from './components/Sports';
// import Series from './components/Series';
import TeleRealite from './components/TeleRealite';
import EmissionCategoriesScreen from './screens/EmissionCategoriesScreen';
import MissedScreen from './screens/MissedScreen';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar currentSection={section} onSectionChange={setSection} onLogout={handleLogout} />
      <div style={{ flex: 1, marginLeft: 256 }}>
        <Header onLogout={handleLogout} onSectionChange={setSection} />
        <main style={{ marginTop: 64, padding: 0 }}>
          {section === 'dashboard' && <Dashboard onNavigate={setSection} />}
          {section === 'users' && <UsersScreen />}
          {section === 'teleRealite' && <TeleRealite />}
          {section === 'breakingNews' && <BreakingNews />}
          {section === 'messages' && <Messages />}
          {section === 'reportage' && <Reportages />}
          {/* {section === 'popularPrograms' && <PopularPrograms />} */}
          {section === 'reel' && <Reels />}
          {section === 'divertissement' && <Divertissements />}
          {section === 'jtandmag' && <JTandMag />}
          {section === 'magazine' && <Magazine />}
          {section === 'subscriptions' && <SubscriptionsScreen />}
          {section === 'favorites' && <Favorites />}
          {section === 'comments' && <Comments />}
          {section === 'notifications' && <Notifications />}
          {section === 'likes' && <Likes />}
          {section === 'payments' && <Payments />}
          {section === 'contact' && <Contact />}
          {section === 'programs' && <Programs />}
          {section === 'categories' && <Categories />}
          {section === 'subscriptionPlans' && <SubscriptionPlans />}
          {section === 'archives' && <Archives />}
          {section === 'liveControl' && <LiveControlScreen />}
          {section === 'liveModeration' && <LiveModeration />}
          {section === 'sports' && <Sports />}
          {section === 'emissionCategories' && <EmissionCategoriesScreen />}
          {section === 'missed' && <MissedScreen />}
          {/* {section === 'premium' && <Premium />} */}
          {/* {section === 'uploads' && <Uploads />} */}
          {section === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;