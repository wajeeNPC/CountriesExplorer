import React from 'react';
import { render, screen } from '@testing-library/react';
import CountryCard from '../CountryCard';

// Mock the needed dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => [] // Mock empty favorites array
}));

const mockCountry = {
  name: { common: 'Canada' },
  capital: ['Ottawa'],
  region: 'Americas',
  population: 38005238,
  flags: { png: 'https://flagcdn.com/w320/ca.png' },
  languages: { eng: 'English', fra: 'French' },
  cca3: 'CAN'
};

describe('CountryCard Component', () => {
  it('renders country information correctly', () => {
    render(<CountryCard country={mockCountry} />);
    
    // Check for elements that actually exist in the rendered component
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
    expect(screen.getByText('38,005,238')).toBeInTheDocument();
    
    // Use the correct alt text from the actual component
    expect(screen.getByAltText('Flag of Canada')).toHaveAttribute('src', mockCountry.flags.png);
    
    // Note: The component doesn't seem to display the capital city (Ottawa)
  });

  it('formats population with commas', () => {
    render(<CountryCard country={mockCountry} />);
    expect(screen.getByText('38,005,238')).toBeInTheDocument();
  });
});