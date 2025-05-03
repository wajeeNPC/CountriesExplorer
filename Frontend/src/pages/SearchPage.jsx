import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountryByName, filterCountries } from '../store/countriesSlice';
import CountryCard from '../components/CountryCard';
import { Search, X, Loader } from 'lucide-react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { filteredCountries, status, error } = useSelector((state) => state.countries);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch countries based on search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(fetchCountryByName(debouncedSearchTerm));
    } else {
      dispatch(filterCountries({ searchTerm: '' }));
    }
  }, [debouncedSearchTerm, dispatch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Search Countries</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Find countries by name, capital, or region
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a country..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Searching countries...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center text-red-500 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {status === 'succeeded' && filteredCountries.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-300">
          No countries found matching "{searchTerm}".
        </div>
      )}

      {status === 'succeeded' && filteredCountries.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found {filteredCountries.length} countries
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCountries.map((country) => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;