import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RegionsPage from '../RegionsPage';
import countriesReducer from '../../store/countriesSlice';
// Mock the countrySlice actions
jest.mock('../../store/countriesSlice', () => ({
  ...jest.requireActual('../../store/countriesSlice'),
  fetchCountriesByRegion: jest.fn().mockImplementation((region) => ({ 
    type: 'countries/fetchCountriesByRegion',
    payload: region 
  }))
}));

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn().mockImplementation((action) => action),
  useSelector: jest.fn().mockImplementation(selector => {
    // Create a mock state that matches the structure expected by the component
    const mockState = {
      countries: {
        filteredCountries: [],
        status: 'idle',
        error: null
      }
    };
    return selector(mockState);
  })
}));

// Mock Lucide-react components
jest.mock('lucide-react', () => ({
  Map: () => <div data-testid="map-icon">🗺️</div>,
  Loader: () => <div data-testid="loader-icon">⌛</div>
}));

// Mock CountryCard component
jest.mock('../../components/CountryCard', () => {
  return function MockCountryCard({ country }) {
    return (
      <div data-testid={`country-card-${country.cca3}`}>
        {country.name.common}
      </div>
    );
  };
});

describe('RegionsPage Integration Test', () => {
  let store;
  beforeEach(() => {
    // Set up the Redux store with default state
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          allCountries: [],
          filteredCountries: [],
          countries: [],
          favorites: [],
          status: 'idle',
          error: null
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Check for the heading and map icon
    expect(screen.getByRole('heading', { name: /Explore by Region/i })).toBeInTheDocument();
    expect(screen.getByTestId('map-icon')).toBeInTheDocument();
    expect(screen.getByText(/Discover countries by geographical region/i)).toBeInTheDocument();
  });

  it('displays all region buttons', () => {
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Check if all region buttons are rendered
    const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
    regions.forEach(region => {
      expect(screen.getByRole('button', { name: region })).toBeInTheDocument();
    });
  });

  it('displays instruction message when no region is selected', () => {
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    expect(screen.getByText(/Please select a region to explore/i)).toBeInTheDocument();
  });

  it('dispatches fetchCountriesByRegion when a region is clicked', () => {
    // Track if the action creator was called with the right argument
    const { fetchCountriesByRegion: mockFetchCountriesByRegion } = require('../../store/countriesSlice');
    
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Click the Asia region button
    fireEvent.click(screen.getByRole('button', { name: 'Asia' }));
    
    // Check that the action creator was called with the right argument
    expect(mockFetchCountriesByRegion).toHaveBeenCalledWith('Asia');
  });

  it('displays loading state when status is loading', () => {
    // Override useSelector for this test
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      filteredCountries: [],
      status: 'loading',
      error: null
    }));
    
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Check for loading indicator
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText(/Loading countries/i)).toBeInTheDocument();
  });

  it('displays error message when fetch fails', () => {
    // Override useSelector for this test
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      filteredCountries: [],
      status: 'failed',
      error: 'Failed to fetch countries'
    }));
    
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Check for error message
    expect(screen.getByText(/Error: Failed to fetch countries/i)).toBeInTheDocument();
  });

  it('displays countries when fetch succeeds', () => {
    const mockCountries = [
      {
        name: { common: 'Japan' },
        capital: ['Tokyo'],
        region: 'Asia',
        population: 125836021,
        flags: { png: 'https://flagcdn.com/w320/jp.png' },
        cca3: 'JPN'
      },
      {
        name: { common: 'China' },
        capital: ['Beijing'],
        region: 'Asia',
        population: 1402112000,
        flags: { png: 'https://flagcdn.com/w320/cn.png' },
        cca3: 'CHN'
      }
    ];
    
    // Mock the useState to set selectedRegion to 'Asia'
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [
      'Asia', // Initial state for selectedRegion
      jest.fn() // setState mock
    ]);
    
    // Override useSelector for this test
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      filteredCountries: mockCountries,
      status: 'succeeded',
      error: null
    }));
    
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Now we should see the countries and the count message
    expect(screen.getByText(/Found 2 countries in Asia/i)).toBeInTheDocument();
    expect(screen.getByTestId('country-card-JPN')).toBeInTheDocument();
    expect(screen.getByTestId('country-card-CHN')).toBeInTheDocument();
    
    // Reset the useState mock
    React.useState.mockRestore();
  });

  it('highlights the selected region button', () => {
    render(
      <Provider store={store}>
        <RegionsPage />
      </Provider>
    );
    
    // Initially no button should have the selected class styling
    const asiaButton = screen.getByRole('button', { name: 'Asia' });
    expect(asiaButton.className).toContain('bg-gray-100');
    expect(asiaButton.className).not.toContain('bg-blue-600');
    
    // Click on the Asia button
    fireEvent.click(asiaButton);
    
    // Now the Asia button should have the selected class styling
    expect(asiaButton.className).toContain('bg-blue-600');
    expect(asiaButton.className).not.toContain('bg-gray-100');
  });
  
  // Reset mocks after all tests
  afterAll(() => {
    jest.restoreAllMocks();
  });
});