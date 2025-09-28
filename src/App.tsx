import { useState } from 'react';
import { useAuth } from './hooks/useAuth';

// Components
import Layout from './components/Layout';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Weather from './components/Weather';
import Health from './components/Health';
import FoodSuggestion from './components/FoodSuggestion';
import AusBoard from './components/AusBoard';
import AusKids from './components/AusKids';
import News from './components/News';
import Profile from './components/Profile';

function App() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AusGuard...</p>
        </div>
      </div>
    );
  }

  // Show landing page first, then auth if user clicks login
  if (!user && !showAuth) {
    return <LandingPage onLogin={() => setShowAuth(true)} />;
  }

  if (!user && showAuth) {
    return <Auth onBack={() => setShowAuth(false)} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'weather':
        return <Weather />;
      case 'health':
        return <Health />;
      case 'food':
        return <FoodSuggestion />;
      case 'ausboard':
        return <AusBoard />;
      case 'auskids':
        return <AusKids />;
      case 'news':
        return <News />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;