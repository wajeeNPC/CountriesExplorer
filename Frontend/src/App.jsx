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
  
  // Initialize dark mode at the App level
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      if (window.matchMedia && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  });

  // Apply dark mode class to HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check if user token exists in local storage
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Initial dark mode setup
    const darkModeFromStorage = localStorage.getItem('darkMode') === 'true';
    if (darkModeFromStorage) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  return (
    <Provider store={store}>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
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