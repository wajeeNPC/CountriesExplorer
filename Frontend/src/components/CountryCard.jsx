// components/CountryCard.jsx
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites } from '../store/countriesSlice';
import { Users, MapPin, Heart } from 'lucide-react';

const CountryCard = ({ country }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.countries.favorites);
  const isFavorite = favorites.some(fav => fav.cca3 === country.cca3);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const formatPopulation = (population) => {
    return new Intl.NumberFormat().format(population);
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }
    
    if (isFavorite) {
      dispatch(removeFromFavorites(country.cca3));
    } else {
      dispatch(addToFavorites(country));
    }
  };

  return (
    <Link to={`/country/${country.cca3}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img 
            src={country.flags.svg || country.flags.png} 
            alt={`Flag of ${country.name.common}`} 
            className="w-full h-40 object-cover"
          />
          <button 
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isFavorite 
                ? 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {country.name.common}
          </h3>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{country.region}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4 mr-1" />
              <span>{formatPopulation(country.population)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CountryCard;