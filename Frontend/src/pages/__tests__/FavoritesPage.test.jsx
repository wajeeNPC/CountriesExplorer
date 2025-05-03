import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FavoritesPage from '../FavoritesPage';
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

// Mock the Lucide-react Heart icon
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">♥</div>
}));

describe('FavoritesPage Integration Test', () => {
  let store;

  beforeEach(() => {
    // Default store setup with empty favorites
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          favorites: [],
          allCountries: [],
          filteredCountries: [],
          countries: [],
          status: 'idle',
          error: null
        }
      }
    });
  });

  it('displays empty state when no favorites exist', () => {
    render(
      <Provider store={store}>
        <FavoritesPage />
      </Provider>
    );
    
    // Check for empty state message
    expect(screen.getByText(/You don't have any favorite countries yet/i)).toBeInTheDocument();
    
    // Check for "Start exploring countries" link
    const exploreLink = screen.getByText(/Start exploring countries/i);
    expect(exploreLink).toBeInTheDocument();
    expect(exploreLink.closest('a')).toHaveAttribute('href', '/search');
  });

  it('displays favorite countries when they exist', () => {
    const mockFavorites = [
      {
        name: { common: 'Canada' },
        capital: ['Ottawa'],
        region: 'Americas',
        population: 38005238,
        flags: { png: 'https://flagcdn.com/w320/ca.png' },
        cca3: 'CAN'
      },
      {
        name: { common: 'Japan' },
        capital: ['Tokyo'],
        region: 'Asia',
        population: 125836021,
        flags: { png: 'https://flagcdn.com/w320/jp.png' },
        cca3: 'JPN'
      }
    ];

    // Create store with favorite countries
    store = configureStore({
      reducer: {
        countries: countriesReducer
      },
      preloadedState: {
        countries: {
          favorites: mockFavorites,
          allCountries: [],
          filteredCountries: [],
          countries: [],
          status: 'idle',
          error: null
        }
      }
    });

    render(
      <Provider store={store}>
        <FavoritesPage />
      </Provider>
    );

    // Check for the title in h1 element
    expect(screen.getByRole('heading', { name: /Your Favorite Countries/i })).toBeInTheDocument();
    
    // Check for both country cards
    expect(screen.getByTestId('country-card-CAN')).toBeInTheDocument();
    expect(screen.getByTestId('country-card-JPN')).toBeInTheDocument();
    
    // Make sure the empty state message is not shown
    expect(screen.queryByText(/You don't have any favorite countries yet/i)).not.toBeInTheDocument();
  });

  it('renders the page header correctly', () => {
    render(
      <Provider store={store}>
        <FavoritesPage />
      </Provider>
    );
    
    // Check for the heading as a role
    expect(screen.getByRole('heading', { name: /Your Favorite Countries/i })).toBeInTheDocument();
    expect(screen.getByText(/View and manage your favorite countries/i)).toBeInTheDocument();
    
    // Check for heart icon
    expect(screen.getAllByTestId('heart-icon').length).toBeGreaterThan(0);
  });
});