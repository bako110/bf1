import React, { useState } from 'react';
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

// Imports existants


// Nouveaux imports
import BreakingNews from './components/BreakingNews';
import Comments from './components/Comments';
import Interviews from './components/Interviews';
import Reels from './components/Reels';
import Replays from './components/Replays';
import TrendingShows from './components/TrendingShows';
import PopularPrograms from './components/PopularPrograms';
import Favorites from './components/Favorites';
// import Notifications from './components/Notifications';
import Likes from './components/Likes';
import Payments from './components/Payments';
import Contact from './components/Contact';
// import Premium from './components/Premium';
// import Uploads from './components/Uploads';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState('dashboard');

  if (!isAdmin) {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentSection={section} onSectionChange={setSection} />
      <div className="flex-1 ml-64">
        <Header onLogout={() => setIsAdmin(false)} onSectionChange={setSection} />
        <main className="mt-16 p-6">
          {section === 'dashboard' && <Dashboard />}
          {section === 'users' && <UsersScreen />}
          {section === 'shows' && <ShowsScreen />}
          {section === 'breakingNews' && <BreakingNews />}
          {section === 'movies' && <MoviesScreen />}
          {section === 'messages' && <Messages />}
          {section === 'replay' && <Replays />}
          {section === 'popularPrograms' && <PopularPrograms />}
          {section === 'reel' && <Reels />}
          {section === 'interview' && <Interviews />}
          {section === 'trendingShow' && <TrendingShows />}
          {section === 'subscriptions' && <SubscriptionsScreen />}
          {section === 'favorites' && <Favorites />}
          {section === 'comments' && <Comments />}
          {/* {section === 'notifications' && <Notifications />} */}
          {section === 'likes' && <Likes />}
          {section === 'payments' && <Payments />}
          {section === 'contact' && <Contact />}
          {/* {section === 'premium' && <Premium />} */}
          {/* {section === 'uploads' && <Uploads />} */}
          {section === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;