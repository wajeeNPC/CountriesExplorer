import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountriesByRegion } from '../store/countriesSlice';
import CountryCard from '../components/CountryCard';
import { Map, Loader } from 'lucide-react';

const RegionsPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const dispatch = useDispatch();
  const { filteredCountries, status, error } = useSelector((state) => state.countries);

  const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  useEffect(() => {
    if (selectedRegion) {
      dispatch(fetchCountriesByRegion(selectedRegion));
    }
  }, [selectedRegion, dispatch]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
          <Map className="w-8 h-8 mr-2 text-blue-600" />
          Explore by Region
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Discover countries by geographical region
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedRegion === region
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading countries...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center text-red-500 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {!selectedRegion && (
        <div className="text-center text-gray-600 dark:text-gray-300 py-16">
          <p className="text-xl">Please select a region to explore</p>
        </div>
      )}

      {status === 'succeeded' && selectedRegion && (
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found {filteredCountries.length} countries in {selectedRegion}
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

export default RegionsPage;