import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthContext } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContextValue = {
  login: mockLogin,
};

// Mock useNavigate - using global mock from __mocks__
const mockNavigate = require('../../../__mocks__/react-router-dom').useNavigate();

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderLogin();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up here' })).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('calls login function and navigates on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Welcome back!',
      description: 'You have successfully logged in.',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('shows error toast on login failure', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows error toast on exception', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    });
  });

  test('disables button and shows loading state during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing In...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  test('close button navigates to home', () => {
    renderLogin();

    const closeButton = screen.getByRole('button', { name: 'Close login form' });
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});