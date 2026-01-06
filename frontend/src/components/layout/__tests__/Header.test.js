import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with default title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('MDRRMO PIO DURAN')).toBeInTheDocument();
    expect(screen.getByAltText('MDRRMO Logo')).toBeInTheDocument();
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  test('renders header with custom title and subtitle', () => {
    render(
      <BrowserRouter>
        <Header title="Custom Title" subtitle="Custom Subtitle" />
      </BrowserRouter>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  test('renders back button when showBack is true', () => {
    render(
      <BrowserRouter>
        <Header showBack={true} />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('button', { name: 'Go back to previous page' });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('does not show back button when showBack is false', () => {
    render(
      <BrowserRouter>
        <Header showBack={false} />
      </BrowserRouter>
    );

    expect(screen.queryByRole('button', { name: 'Go back to previous page' })).not.toBeInTheDocument();
  });

  test('shows hamburger menu on homepage', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(menuButton).toBeInTheDocument();
  });

  test('toggles menu on hamburger button click', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Close menu
    fireEvent.click(menuButton);
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('navigates to login when login menu item is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menuButton);

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('navigates to settings when settings menu item is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menuButton);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('opens about dialog when about menu item is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menuButton);

    const aboutButton = screen.getByRole('button', { name: /about/i });
    fireEvent.click(aboutButton);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/This app is designed to assist in disaster management/)).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('closes menu when clicking outside', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menuButton);

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Click outside the menu
    fireEvent.click(document.body);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('closes menu on escape key press', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menuButton);

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('does not show hamburger menu on non-homepage routes', () => {
    // Mock useLocation to return a different pathname
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useLocation: () => ({ pathname: '/dashboard' }),
    }));

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.queryByRole('button', { name: 'Open navigation menu' })).not.toBeInTheDocument();
  });
});