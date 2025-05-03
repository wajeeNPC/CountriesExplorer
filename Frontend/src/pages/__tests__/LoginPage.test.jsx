import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../LoginPage';
import authReducer from '../../store/authSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <span data-testid="user-icon">👤</span>,
  Lock: () => <span data-testid="lock-icon">🔒</span>,
  LogIn: () => <span data-testid="login-icon">🔑</span>,
  UserPlus: () => <span data-testid="user-plus-icon">➕👤</span>,
}));

// Mock the useDispatch hook
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

// Mock setTimeout
jest.useFakeTimers();

describe('LoginPage Component Tests', () => {
  let store;
  const mockSetIsLoggedIn = jest.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        },
      },
    });

    // Reset mocks
    mockDispatch.mockReset();
    mockSetIsLoggedIn.mockReset();
    global.alert = jest.fn();
  });

  it('renders the login form by default', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );

    // Check if login tab is active
    const loginTab = screen.getByText('Login');
    expect(loginTab.parentElement).toHaveClass('text-blue-600');

    // Check if form elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Email and confirm password should not be shown in login mode
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    
    // Check login button text
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('switches to registration form when register tab is clicked', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Click on register tab
    fireEvent.click(screen.getByText('Register'));
    
    // Check if register tab is active
    const registerTab = screen.getByText('Register');
    expect(registerTab.parentElement).toHaveClass('text-blue-600');
    
    // All form fields should be present in register mode
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    
    // Check register button text
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('validates login form and shows errors', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Submit form with empty fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if error messages are displayed
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('validates password length on login form', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Fill username but with short password
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12345' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if password error is displayed
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('validates registration form and shows errors', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Switch to register tab
    fireEvent.click(screen.getByText('Register'));
    
    // Submit form with empty fields
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if error messages are displayed
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('validates email format in registration form', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Switch to register tab
    fireEvent.click(screen.getByText('Register'));
    
    // Fill form with invalid email
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if email error is displayed
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  it('validates password matching in registration form', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Switch to register tab
    fireEvent.click(screen.getByText('Register'));
    
    // Fill form with non-matching passwords
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpassword' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if password matching error is displayed
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('clears errors when user starts typing', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Submit form with empty fields to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Verify errors are shown
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    
    // Start typing in username field
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 't' } });
    
    // Verify username error is cleared
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });

  it('shows loading state during login submission', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if loading state is displayed
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('dispatches login action after successful form submission', async () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Fast-forward timer to simulate API call
    jest.advanceTimersByTime(1000);
    
    // Check if login action was dispatched
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
    });
  });

  it('shows alert after successful registration', async () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Switch to register tab
    fireEvent.click(screen.getByText('Register'));
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Fast-forward timer to simulate API call
    jest.advanceTimersByTime(1000);
    
    // Check if alert was shown and form was reset to login mode
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
      expect(screen.getByText('Login').parentElement).toHaveClass('text-blue-600');
    });
  });

  it('disables submit button while loading', () => {
    render(
      <Provider store={store}>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} />
      </Provider>
    );
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if button is disabled during loading
    expect(submitButton).toBeDisabled();
    
    // Fast-forward timer to finish loading
    jest.advanceTimersByTime(1000);
  });
});