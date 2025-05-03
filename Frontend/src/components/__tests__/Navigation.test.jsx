import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn().mockReturnValue(null),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn()
}));

describe('Navigation Component', () => {
  const mockIsLoggedIn = true;
  const mockSetIsLoggedIn = jest.fn();
  
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Navigation isLoggedIn={mockIsLoggedIn} setIsLoggedIn={mockSetIsLoggedIn} />
      </BrowserRouter>
    );
  });

  it('renders navigation links', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Regions')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    // Check that the mobile menu is visible with its content
    const mobileLogoutButton = screen.getByTestId('mobile-logout');
    expect(mobileLogoutButton).toBeInTheDocument();
    
    // Click the menu button again to close it
    fireEvent.click(menuButton);
    // The mobile menu should now be hidden
    expect(screen.queryByTestId('mobile-logout')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    // For mobile view
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    
    // Use test ID to get the mobile logout button
    const mobileLogoutButton = screen.getByTestId('mobile-logout');
    fireEvent.click(mobileLogoutButton);
    
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
  });
});