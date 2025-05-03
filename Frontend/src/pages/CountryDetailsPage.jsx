import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountryByCode, addToFavorites, removeFromFavorites } from '../store/countriesSlice';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Globe2, 
  Languages, 
  Heart,
  Building2,
  Coins,
  Clock,
  Flag
} from 'lucide-react';

const CountryDetailsPage = () => {
  const { countryCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCountry, status, error, favorites } = useSelector((state) => state.countries);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const isFavorite = favorites.some(fav => fav?.cca3 === countryCode);

  useEffect(() => {
    dispatch(fetchCountryByCode(countryCode));
  }, [dispatch, countryCode]);

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }
    
    if (isFavorite) {
      dispatch(removeFromFavorites(countryCode));
    } else if (selectedCountry) {
      dispatch(addToFavorites(selectedCountry));
    }
  };

  const formatPopulation = (population) => {
    return new Intl.NumberFormat().format(population);
  };

  const getLanguages = (languages) => {
    return languages ? Object.values(languages).join(', ') : 'N/A';
  };

  const getCurrencies = (currencies) => {
    return currencies 
      ? Object.values(currencies).map(currency => `${currency.name} (${currency.symbol})`).join(', ') 
      : 'N/A';
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading country details...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  if (!selectedCountry) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-300">Country not found.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        <button 
          onClick={handleFavoriteToggle}
          className={`flex items-center px-3 py-1 rounded-full ${
            isFavorite 
              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <Heart className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img 
                src={selectedCountry.flags.svg || selectedCountry.flags.png} 
                alt={`Flag of ${selectedCountry.name.common}`} 
                className="w-full h-auto rounded-lg shadow"
              />
              
              {selectedCountry.coatOfArms?.svg && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Coat of Arms
                  </h3>
                  <img 
                    src={selectedCountry.coatOfArms.svg} 
                    alt={`Coat of Arms of ${selectedCountry.name.common}`} 
                    className="w-24 h-auto mx-auto"
                  />
                </div>
              )}
            </div>
            
            <div className="md:w-1/2 md:pl-6 mt-6 md:mt-0">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedCountry.name.common} {selectedCountry.flag}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {selectedCountry.name.official}
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Capital</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCountry.capital?.[0] || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Region</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCountry.region}, {selectedCountry.subregion || ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Population</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {formatPopulation(selectedCountry.population)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Languages</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {getLanguages(selectedCountry.languages)}
                    </p>
                    </div>
                </div>
                
                <div className="flex items-start">
                  <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Currencies</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {getCurrencies(selectedCountry.currencies)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Top Level Domain</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCountry.tld?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Timezones</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCountry.timezones?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {selectedCountry.borders && selectedCountry.borders.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                <Flag className="w-5 h-5 inline-block mr-2" />
                Bordering Countries
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCountry.borders.map((border) => (
                  <button
                    key={border}
                    onClick={() => navigate(`/country/${border}`)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {border}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedCountry.maps?.googleMaps && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                <MapPin className="w-5 h-5 inline-block mr-2" />
                Maps
              </h3>
              <a
                href={selectedCountry.maps.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryDetailsPage;