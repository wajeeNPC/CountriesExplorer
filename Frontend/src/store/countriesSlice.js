import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://restcountries.com/v3.1';

// Async thunks
export const fetchAllCountries = createAsyncThunk('countries/fetchAll', async () => {
  const response = await axios.get(`${BASE_URL}/all`);
  return response.data;
});

export const fetchCountryByName = createAsyncThunk('countries/fetchByName', async (name) => {
  const response = await axios.get(`${BASE_URL}/name/${name}`);
  return response.data;
});

export const fetchCountriesByRegion = createAsyncThunk('countries/fetchByRegion', async (region) => {
  const response = await axios.get(`${BASE_URL}/region/${region}`);
  return response.data;
});

export const fetchCountryByCode = createAsyncThunk('countries/fetchByCode', async (code) => {
  const response = await axios.get(`${BASE_URL}/alpha/${code}`);
  return response.data;
});

const initialState = {
  allCountries: [],
  filteredCountries: [],
  selectedCountry: null,
  favorites: [],
  status: 'idle',
  error: null,
};

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    filterCountries: (state, action) => {
      const { searchTerm } = action.payload;
      state.filteredCountries = !searchTerm
        ? state.allCountries
        : state.allCountries.filter((country) =>
            country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
          );
    },
    addToFavorites: (state, action) => {
      const country = action.payload;
      if (!state.favorites.some((fav) => fav.cca3 === country.cca3)) {
        state.favorites.push(country);
      }
    },
    removeFromFavorites: (state, action) => {
      const countryCode = action.payload;
      state.favorites = state.favorites.filter((country) => country.cca3 !== countryCode);
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCountries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCountries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allCountries = action.payload;
        state.filteredCountries = action.payload;
      })
      .addCase(fetchAllCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCountryByName.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountryByName.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredCountries = action.payload;
      })
      .addCase(fetchCountryByName.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCountriesByRegion.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountriesByRegion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredCountries = action.payload;
      })
      .addCase(fetchCountriesByRegion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCountryByCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountryByCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedCountry = action.payload[0];
      })
      .addCase(fetchCountryByCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const {
  filterCountries,
  addToFavorites,
  removeFromFavorites,
  setSelectedCountry,
} = countriesSlice.actions;

export default countriesSlice.reducer;
