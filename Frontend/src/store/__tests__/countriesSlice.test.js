import countriesReducer, {
    fetchAllCountries,
    filterCountries,
    addToFavorites,
    removeFromFavorites,
    setSelectedCountry
  } from '../countriesSlice';
  
  describe('countriesSlice', () => {
    const initialState = {
      allCountries: [],
      filteredCountries: [],
      selectedCountry: null,
      favorites: [],
      status: 'idle',
      error: null
    };
  
    it('should handle initial state', () => {
      expect(countriesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    describe('filterCountries', () => {
      it('should filter countries by search term', () => {
        const state = {
          ...initialState,
          allCountries: [
            { name: { common: 'Canada' }, cca3: 'CAN' },
            { name: { common: 'Mexico' }, cca3: 'MEX' }
          ]
        };
        
        const action = filterCountries({ searchTerm: 'can' });
        const result = countriesReducer(state, action);
        
        expect(result.filteredCountries).toEqual([{ name: { common: 'Canada' }, cca3: 'CAN' }]);
      });
    });
  
    describe('favorites', () => {
      it('should add a country to favorites', () => {
        const country = { name: { common: 'Canada' }, cca3: 'CAN' };
        const action = addToFavorites(country);
        const result = countriesReducer(initialState, action);
        
        expect(result.favorites).toEqual([country]);
      });
  
      it('should remove a country from favorites', () => {
        const state = {
          ...initialState,
          favorites: [{ name: { common: 'Canada' }, cca3: 'CAN' }]
        };
        
        const action = removeFromFavorites('CAN');
        const result = countriesReducer(state, action);
        
        expect(result.favorites).toEqual([]);
      });
    });
  });