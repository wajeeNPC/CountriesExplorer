import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CountryCard from '../components/CountryCard';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const { favorites } = useSelector((state) => state.countries);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
          <Heart className="w-8 h-8 mr-2 text-red-500" />
          Your Favorite Countries
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          View and manage your favorite countries
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            You don't have any favorite countries yet
          </p>
          <Link
            to="/search"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start exploring countries
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;