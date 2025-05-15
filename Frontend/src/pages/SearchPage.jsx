import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCountries, filterCountries } from '../store/countriesSlice';
import CountryCard from '../components/CountryCard';
import { Search, X, Loader, Filter } from 'lucide-react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedSubregion, setSelectedSubregion] = useState('All Subregions');
  const [minPopulation, setMinPopulation] = useState('');
  const [maxPopulation, setMaxPopulation] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  
  const dispatch = useDispatch();
  const { filteredCountries, allCountries, status, error } = useSelector((state) => state.countries);
  
  // Get unique regions and subregions
  const regions = ['All Regions', ...new Set(allCountries?.map(country => country.region).filter(Boolean))];
  const subregions = ['All Subregions'];
  
  if (selectedRegion !== 'All Regions') {
    const filteredSubregions = new Set(
      allCountries
        ?.filter(country => country.region === selectedRegion)
        .map(country => country.subregion)
        .filter(Boolean)
    );
    subregions.push(...filteredSubregions);
  }

  // Fetch all countries on initial load if not already fetched
  useEffect(() => {
    if (!allCountries?.length) {
      dispatch(fetchAllCountries());
    }
  }, [dispatch, allCountries?.length]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters when any filter changes
  useEffect(() => {
    if (allCountries?.length > 0) {
      dispatch(filterCountries({
        searchTerm: debouncedSearchTerm,
        region: selectedRegion === 'All Regions' ? null : selectedRegion,
        subregion: selectedSubregion === 'All Subregions' ? null : selectedSubregion,
        minPopulation: minPopulation ? parseInt(minPopulation) : null,
        maxPopulation: maxPopulation ? parseInt(maxPopulation) : null,
        minArea: minArea ? parseFloat(minArea) : null,
        maxArea: maxArea ? parseFloat(maxArea) : null
      }));
    }
  }, [
    debouncedSearchTerm, 
    selectedRegion, 
    selectedSubregion, 
    minPopulation, 
    maxPopulation, 
    minArea, 
    maxArea, 
    allCountries?.length,
    dispatch
  ]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const resetFilters = () => {
    setSelectedRegion('All Regions');
    setSelectedSubregion('All Subregions');
    setMinPopulation('');
    setMaxPopulation('');
    setMinArea('');
    setMaxArea('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Search Countries</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Find and filter countries by various criteria
        </p>
      </div>

      {/* Search bar */}
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

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <h2 className="font-medium text-gray-700 dark:text-gray-200">Filters</h2>
          </div>
          <button 
            onClick={resetFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Region filter */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Region
            </label>
            <select
              id="region"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedSubregion('All Subregions');
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Subregion filter */}
          <div>
            <label htmlFor="subregion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subregion
            </label>
            <select
              id="subregion"
              value={selectedSubregion}
              onChange={(e) => setSelectedSubregion(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedRegion === 'All Regions'}
            >
              {subregions.map(subregion => (
                <option key={subregion} value={subregion}>{subregion}</option>
              ))}
            </select>
          </div>

          {/* Population range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="minPopulation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Population
              </label>
              <input
                type="number"
                id="minPopulation"
                value={minPopulation}
                onChange={(e) => setMinPopulation(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="maxPopulation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Population
              </label>
              <input
                type="number"
                id="maxPopulation"
                value={maxPopulation}
                onChange={(e) => setMaxPopulation(e.target.value)}
                placeholder="∞"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Area range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="minArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Area (km²)
              </label>
              <input
                type="number"
                id="minArea"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="maxArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Area (km²)
              </label>
              <input
                type="number"
                id="maxArea"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                placeholder="∞"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Searching countries...</p>
        </div>
      )}

      {/* Error state */}
      {status === 'failed' && (
        <div className="text-center text-red-500 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {/* No results */}
      {status === 'succeeded' && filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-300 text-lg">
            No countries found matching your criteria.
          </div>
          <button 
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Results */}
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