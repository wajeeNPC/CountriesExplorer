import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HomePage from '../HomePage';
import countriesReducer from '../../store/countriesSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn()
}));

// Mock CountryCard component with proper test ID
jest.mock('../../components/CountryCard', () => {
  return function MockCountryCard({ country }) {
    return (
      <div data-testid={`country-card-${country.cca3}`}>
        {country.name.common}
      </div>
    );
  };
});

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn()
}));

describe('HomePage Integration Test', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          allCountries: [], // Add the missing allCountries field
          filteredCountries: [], // Add filteredCountries if used in component
          countries: [],
          status: 'idle',
          error: null
        }
      }
    });
  });

  it('displays loading state initially', () => {
    // Set initial state to loading
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          allCountries: [], // Add here too
          filteredCountries: [],
          countries: [],
          status: 'loading',
          error: null
        }
      }
    });
    
    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );
    
    expect(screen.getByText(/loading countries/i)).toBeInTheDocument();
  });

  it('displays countries after successful load', async () => {
    const mockCountries = [{
      name: { common: 'Canada' },
      capital: ['Ottawa'],
      region: 'Americas',
      population: 38005238,
      flags: { png: 'https://flagcdn.com/w320/ca.png' },
      cca3: 'CAN'
    }];

    // Start with success state directly - no need to transition
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          // Set both allCountries and countries to the mock data
          allCountries: mockCountries,
          filteredCountries: mockCountries,
          countries: mockCountries,
          status: 'succeeded',
          error: null
        }
      }
    });

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Check for either the country name or the card component
    await waitFor(() => {
      const countryElement = screen.getByTestId('country-card-CAN') || 
                             screen.getByText('Canada');
      expect(countryElement).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    // Start with error state directly
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          allCountries: [], // Add here too
          filteredCountries: [],
          countries: [],
          status: 'failed',
          error: 'Failed to fetch countries'
        }
      }
    });
    
    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Look for the error message
    await waitFor(() => {
      const errorElement = screen.getByText((content) => {
        return content.includes('Failed to fetch countries');
      }, { exact: false });
      expect(errorElement).toBeInTheDocument();
    });
  });
});