import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CountryDetailsPage from '../CountryDetailsPage';
import countriesReducer from '../../store/countriesSlice';
import authReducer from '../../store/authSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({ countryCode: 'USA' }),
  useNavigate: () => jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  Users: () => <span data-testid="users-icon">👥</span>,
  MapPin: () => <span data-testid="map-pin-icon">📍</span>,
  Globe2: () => <span data-testid="globe-icon">🌐</span>,
  Languages: () => <span data-testid="languages-icon">🗣️</span>,
  Heart: (props) => <span data-testid="heart-icon" className={props.className}>❤️</span>,
  Building2: () => <span data-testid="building-icon">🏢</span>,
  Coins: () => <span data-testid="coins-icon">💰</span>,
  Clock: () => <span data-testid="clock-icon">🕒</span>,
  Flag: () => <span data-testid="flag-icon">🏁</span>,
}));

// Mock useDispatch and create a mock function
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('CountryDetailsPage Integration Test', () => {
  let store;
  const mockSelectedCountry = {
    cca3: 'USA',
    name: {
      common: 'United States',
      official: 'United States of America',
    },
    flags: {
      svg: 'https://flagcdn.com/us.svg',
      png: 'https://flagcdn.com/w320/us.png',
    },
    coatOfArms: {
      svg: 'https://mainfacts.com/media/images/coats_of_arms/us.svg',
    },
    capital: ['Washington, D.C.'],
    region: 'Americas',
    subregion: 'North America',
    population: 331002651,
    languages: { eng: 'English' },
    currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
    tld: ['.us'],
    timezones: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00'],
    borders: ['CAN', 'MEX'],
    maps: {
      googleMaps: 'https://goo.gl/maps/e8M246zY4BSjkjAv6',
    },
    flag: '🇺🇸',
  };

  beforeEach(() => {
    // Reset mock dispatch function
    mockDispatch.mockReset();

    // Create store with default state
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: null,
          status: 'idle',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });
  });

  it('dispatches fetchCountryByCode on mount', () => {
    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Check if fetchCountryByCode was called with correct country code
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('displays loading state correctly', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: null,
          status: 'loading',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    expect(screen.getByText(/loading country details/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: null,
          status: 'failed',
          error: 'Could not fetch country details',
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
    expect(screen.getByText(/could not fetch country details/i)).toBeInTheDocument();
    expect(screen.getByText(/go back/i)).toBeInTheDocument();
  });

  it('displays "Country not found" when selectedCountry is null', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: null,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    expect(screen.getByText(/country not found/i)).toBeInTheDocument();
    expect(screen.getByText(/go back/i)).toBeInTheDocument();
  });

  it('displays country details correctly', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: mockSelectedCountry,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Check for country name and details
    expect(screen.getByText('United States 🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('United States of America')).toBeInTheDocument();
    
    // Check for capital
    expect(screen.getByText('Capital')).toBeInTheDocument();
    expect(screen.getByText('Washington, D.C.')).toBeInTheDocument();
    
    // Check for region
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Americas, North America')).toBeInTheDocument();
    
    // Check for population
    expect(screen.getByText('Population')).toBeInTheDocument();
    expect(screen.getByText('331,002,651')).toBeInTheDocument();
    
    // Check for languages
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    
    // Check for currencies
    expect(screen.getByText('Currencies')).toBeInTheDocument();
    expect(screen.getByText('United States Dollar ($)')).toBeInTheDocument();
    
    // Check for border countries section
    expect(screen.getByText('Bordering Countries')).toBeInTheDocument();
    expect(screen.getByText('CAN')).toBeInTheDocument();
    expect(screen.getByText('MEX')).toBeInTheDocument();
    
    // Check for maps link
    expect(screen.getByText('Maps')).toBeInTheDocument();
    expect(screen.getByText('View on Google Maps')).toBeInTheDocument();
    expect(screen.getByText('View on Google Maps').getAttribute('href')).toBe('https://goo.gl/maps/e8M246zY4BSjkjAv6');
  });

  it('handles favorite button click when not authenticated', () => {
    global.alert = jest.fn();
    
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: mockSelectedCountry,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Click the favorite button
    const favoriteButton = screen.getByText('Add to Favorites');
    fireEvent.click(favoriteButton);
    
    // Check if alert was shown
    expect(global.alert).toHaveBeenCalledWith('Please log in to add favorites');
    // Verify dispatch was not called for adding to favorites
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ 
      type: expect.stringMatching(/addToFavorites/)
    }));
  });

  it('adds country to favorites when authenticated', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: mockSelectedCountry,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: true,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Click the favorite button
    const favoriteButton = screen.getByText('Add to Favorites');
    fireEvent.click(favoriteButton);
    
    // Check if addToFavorites was dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('removes country from favorites when already in favorites', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: mockSelectedCountry,
          status: 'succeeded',
          error: null,
          favorites: [mockSelectedCountry],
        },
        auth: {
          isAuthenticated: true,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Should show "Remove from Favorites"
    expect(screen.getByText('Remove from Favorites')).toBeInTheDocument();
    
    // Click the favorite button
    const favoriteButton = screen.getByText('Remove from Favorites');
    fireEvent.click(favoriteButton);
    
    // Check if removeFromFavorites was dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders coat of arms when available', () => {
    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: mockSelectedCountry,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Check if coat of arms is displayed
    expect(screen.getByText('Coat of Arms')).toBeInTheDocument();
    const coatOfArmsImg = screen.getByAltText('Coat of Arms of United States');
    expect(coatOfArmsImg).toBeInTheDocument();
    expect(coatOfArmsImg.getAttribute('src')).toBe('https://mainfacts.com/media/images/coats_of_arms/us.svg');
  });

  it('handles null values gracefully', () => {
    const countryWithNulls = {
      ...mockSelectedCountry,
      capital: null,
      currencies: null,
      languages: null,
      tld: null,
      timezones: null,
      borders: null,
      maps: null,
    };

    store = configureStore({
      reducer: {
        countries: countriesReducer,
        auth: authReducer,
      },
      preloadedState: {
        countries: {
          selectedCountry: countryWithNulls,
          status: 'succeeded',
          error: null,
          favorites: [],
        },
        auth: {
          isAuthenticated: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <CountryDetailsPage />
      </Provider>
    );

    // Check that all N/A values are displayed correctly
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    
    // Bordering Countries section should not be present
    expect(screen.queryByText('Bordering Countries')).not.toBeInTheDocument();
    
    // Maps section should not be present
    expect(screen.queryByText('Maps')).not.toBeInTheDocument();
  });
});