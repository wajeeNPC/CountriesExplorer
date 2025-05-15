import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Globe, Search, Map, Heart, User, Menu, X, Moon, Sun } from 'lucide-react';

const Navigation = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialize dark mode state from localStorage or system preference
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
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Update the DOM when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', isDarkMode);
    }
  }, [isDarkMode]);

  // Initial setup on component mount
  useEffect(() => {
    // Check if we need to apply dark mode on initial render
    if (typeof window !== 'undefined' && window.localStorage) {
      const darkModeFromStorage = localStorage.getItem('darkMode') === 'true';
      if (darkModeFromStorage) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsLoggedIn(false);
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  const navLinks = [
    { path: '/', name: 'Home', icon: <Globe className="w-5 h-5" /> },
    { path: '/search', name: 'Search', icon: <Search className="w-5 h-5" /> },
    { path: '/regions', name: 'Regions', icon: <Map className="w-5 h-5" /> },
    { path: '/favorites', name: 'Favorites', icon: <Heart className="w-5 h-5" /> },
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-100 dark:bg-blue-900' : '';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">Countries Explorer</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive(link.path)}`}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
            
            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button> */}
            
            {isLoggedIn ? (
              <button
                data-testid="desktop-logout"
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-5 h-5 inline-block mr-1" />
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button> */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive(link.path)}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
            
            {isLoggedIn ? (
              <button
                data-testid="mobile-logout"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
              >
                <User className="w-5 h-5" />
                <span className="ml-2">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="ml-2">Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;