import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import { AuthContext } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockRegister = jest.fn();
const mockAuthContextValue = {
  register: mockRegister,
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <Register />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form correctly', () => {
    renderRegister();

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Join our community today')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in here' })).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('shows error for password mismatch', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
    fireEvent.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Password mismatch',
      description: 'Passwords do not match.',
      variant: 'destructive',
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('shows error for short password', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Invalid password',
      description: 'Password must be at least 6 characters long.',
      variant: 'destructive',
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('calls register function and navigates on successful registration', async () => {
    mockRegister.mockResolvedValue({ success: true });

    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Account created!',
      description: 'Your account has been successfully created. Please log in.',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows error toast on registration failure', async () => {
    mockRegister.mockResolvedValue({ success: false, error: 'Username already exists' });

    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration failed',
        description: 'Username already exists',
        variant: 'destructive',
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows error toast on exception', async () => {
    mockRegister.mockRejectedValue(new Error('Network error'));

    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
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
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    renderRegister();

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  test('close button navigates to home', () => {
    renderRegister();

    const closeButton = screen.getByRole('button', { name: 'Close registration form' });
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});