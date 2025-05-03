import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SearchPage from '../SearchPage';
import countriesReducer from '../../store/countriesSlice';

// Create actual mock functions before mocking the module
const mockFetchCountryByName = jest.fn();
const mockFilterCountries = jest.fn();

// Mock the countriesSlice module
jest.mock('../../store/countriesSlice', () => {
  const originalModule = jest.requireActual('../../store/countriesSlice');
  
  // Return an object that includes both the original exports 
  // and our mocked functions
  return {
    __esModule: true,
    ...originalModule,
    fetchCountryByName: (...args) => {
      mockFetchCountryByName(...args);
      return { type: 'countries/fetchByName', payload: args[0] };
    },
    filterCountries: (...args) => {
      mockFilterCountries(...args);
      return { type: 'countries/filterCountries', payload: args[0] };
    }
  };
});

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(action => action),
  useSelector: jest.fn().mockImplementation(selector => {
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
  Search: () => <div data-testid="search-icon">🔍</div>,
  X: () => <div data-testid="clear-icon">✖</div>,
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

describe('SearchPage Integration Test', () => {
  let store;
  
  beforeEach(() => {
    // Reset mocks
    mockFetchCountryByName.mockClear();
    mockFilterCountries.mockClear();
    
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
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders the page header correctly', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    expect(screen.getByRole('heading', { name: /Search Countries/i })).toBeInTheDocument();
    expect(screen.getByText(/Find countries by name, capital, or region/i)).toBeInTheDocument();
  });

  it('renders the search input with correct placeholder', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('updates search term when typing in the input', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'germany' } });
    
    expect(searchInput.value).toBe('germany');
  });

  it('shows clear button when search term is entered', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    
    // Initially clear button should not be visible
    expect(screen.queryByTestId('clear-icon')).not.toBeInTheDocument();
    
    // Add search term
    fireEvent.change(searchInput, { target: { value: 'france' } });
    
    // Now clear button should be visible
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
  });

  it('clears search term when clear button is clicked', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    
    // Add search term
    fireEvent.change(searchInput, { target: { value: 'spain' } });
    expect(searchInput.value).toBe('spain');
    
    // Click clear button
    const clearButton = screen.getByTestId('clear-icon').parentElement;
    fireEvent.click(clearButton);
    
    // Search term should be cleared
    expect(searchInput.value).toBe('');
  });

  it('dispatches filterCountries when search field is cleared', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    
    // Add search term
    fireEvent.change(searchInput, { target: { value: 'italy' } });
    
    // Clear the search
    const clearButton = screen.getByTestId('clear-icon').parentElement;
    fireEvent.click(clearButton);
    
    // Fast-forward timers to trigger the debounce
    jest.runAllTimers();
    
    // Check that filterCountries was called with empty search term
    expect(mockFilterCountries).toHaveBeenCalledWith({ searchTerm: '' });
  });

  it('dispatches fetchCountryByName with debounced search term', () => {
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText(/Search for a country/i);
    
    // Type a search term
    fireEvent.change(searchInput, { target: { value: 'canada' } });
    
    // Initially, the fetchCountryByName should not be called
    expect(mockFetchCountryByName).not.toHaveBeenCalled();
    
    // Advance timers by 500ms to trigger the debounce timeout
    jest.advanceTimersByTime(500);
    
    // Now the fetchCountryByName should be called with 'canada'
    expect(mockFetchCountryByName).toHaveBeenCalledWith('canada');
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
        <SearchPage />
      </Provider>
    );
    
    // Check for loading indicator
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText(/Searching countries/i)).toBeInTheDocument();
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
        <SearchPage />
      </Provider>
    );
    
    // Check for error message
    expect(screen.getByText(/Error: Failed to fetch countries/i)).toBeInTheDocument();
  });

  it('displays "no countries found" message when search returns empty result', () => {
    // Set up a search term in the component state
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [
      'nonexistentcountry', // Initial state for searchTerm
      jest.fn() // setState mock
    ]);
    
    // Override useSelector for this test
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      filteredCountries: [],
      status: 'succeeded',
      error: null
    }));
    
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    // Check for "no results" message including the search term
    expect(screen.getByText(/No countries found matching "nonexistentcountry"/i)).toBeInTheDocument();
    
    // Reset the useState mock
    React.useState.mockRestore();
  });

  it('displays countries when fetch succeeds with results', () => {
    const mockCountries = [
      {
        name: { common: 'United Kingdom' },
        capital: ['London'],
        region: 'Europe',
        population: 67215293,
        flags: { png: 'https://flagcdn.com/w320/gb.png' },
        cca3: 'GBR'
      },
      {
        name: { common: 'United States' },
        capital: ['Washington, D.C.'],
        region: 'Americas',
        population: 329484123,
        flags: { png: 'https://flagcdn.com/w320/us.png' },
        cca3: 'USA'
      }
    ];
    
    // Override useSelector for this test
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      filteredCountries: mockCountries,
      status: 'succeeded',
      error: null
    }));
    
    render(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    
    // Now we should see the countries and the count message
    expect(screen.getByText(/Found 2 countries/i)).toBeInTheDocument();
    expect(screen.getByTestId('country-card-GBR')).toBeInTheDocument();
    expect(screen.getByTestId('country-card-USA')).toBeInTheDocument();
  });
  
  // Reset mocks after all tests
  afterAll(() => {
    jest.restoreAllMocks();
  });
});