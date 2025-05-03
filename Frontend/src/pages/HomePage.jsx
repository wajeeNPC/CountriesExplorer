import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCountries } from '../store/countriesSlice';
import CountryCard from '../components/CountryCard';
import { Globe, Loader } from 'lucide-react';

const HomePage = () => {
  const dispatch = useDispatch();
  const { allCountries, status, error } = useSelector((state) => state.countries);
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllCountries());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading countries...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
        <button 
          onClick={() => dispatch(fetchAllCountries())} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
          <Globe className="w-8 h-8 mr-2 text-blue-600" />
          Explore Countries Around the World
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Discover detailed information about countries, their flags, populations, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allCountries.slice(0, 20).map((country) => (
          <CountryCard key={country.cca3} country={country} />
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-300">
          Showing 20 of {allCountries.length} countries. Use the search or regions filter to find more.
        </p>
      </div>
    </div>
  );
};

export default HomePage;