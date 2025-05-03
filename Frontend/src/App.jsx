import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CountryDetailsPage from './pages/CountryDetailsPage';
import SearchPage from './pages/SearchPage';
import RegionsPage from './pages/RegionsPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user token exists in local storage
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Provider store={store}>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/country/:countryCode" element={<CountryDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/regions" element={<RegionsPage />} />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <FavoritesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                isLoggedIn ? <Navigate to="/" /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Provider>
  );
}

export default App;