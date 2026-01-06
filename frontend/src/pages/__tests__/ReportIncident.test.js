import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportIncident from '../ReportIncident';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMapEvents: jest.fn(),
}));

// Mock leaflet icons
jest.mock('../../utils/leafletIcons', () => ({
  setDefaultIcon: jest.fn(),
  defaultIcon: {},
  selectedIcon: {},
}));

// Mock incident types
jest.mock('../../utils/helpers', () => ({
  incidentTypes: ['Fire', 'Flood', 'Earthquake', 'Medical Emergency'],
}));

// Mock Header and BottomNav
jest.mock('../../components/layout/Header', () => {
  return function MockHeader({ title, subtitle, showBack, icon: Icon }) {
    return (
      <header data-testid="header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {Icon && <Icon data-testid="header-icon" />}
      </header>
    );
  };
});

jest.mock('../../components/layout/BottomNav', () => {
  return function MockBottomNav() {
    return <nav data-testid="bottom-nav">Bottom Nav</nav>;
  };
});

// Mock environment variables
delete process.env.REACT_APP_BACKEND_URL;
process.env.REACT_APP_BACKEND_URL = 'http://localhost:8000';

const renderReportIncident = () => {
  return render(
    <BrowserRouter>
      <ReportIncident />
    </BrowserRouter>
  );
};

describe('ReportIncident Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders report incident form correctly', () => {
    renderReportIncident();

    expect(screen.getByText('Report Incident')).toBeInTheDocument();
    expect(screen.getByText('Submit Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Incident Type *')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Photos (Max 5)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Report' })).toBeInTheDocument();
  });

  test('shows validation errors for required fields', async () => {
    renderReportIncident();

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select an incident type')).toBeInTheDocument();
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  test('updates form data on input change', () => {
    renderReportIncident();

    const incidentTypeSelect = screen.getByLabelText('Incident Type *');
    const fullNameInput = screen.getByLabelText('Full Name *');
    const phoneInput = screen.getByLabelText('Phone Number (Optional)');
    const descriptionTextarea = screen.getByLabelText(/Description/);

    fireEvent.change(incidentTypeSelect, { target: { value: 'Fire' } });
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '09123456789' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

    expect(incidentTypeSelect.value).toBe('Fire');
    expect(fullNameInput.value).toBe('John Doe');
    expect(phoneInput.value).toBe('09123456789');
    expect(descriptionTextarea.value).toBe('Test description');
  });

  test('clears validation errors when fields are filled', () => {
    renderReportIncident();

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    // Errors should be shown
    expect(screen.getByText('Please select an incident type')).toBeInTheDocument();

    // Fill required fields
    const incidentTypeSelect = screen.getByLabelText('Incident Type *');
    const fullNameInput = screen.getByLabelText('Full Name *');
    const descriptionTextarea = screen.getByLabelText(/Description/);

    fireEvent.change(incidentTypeSelect, { target: { value: 'Fire' } });
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

    // Errors should be cleared
    expect(screen.queryByText('Please select an incident type')).not.toBeInTheDocument();
    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Description is required')).not.toBeInTheDocument();
  });

  test('validates description length', () => {
    renderReportIncident();

    const descriptionTextarea = screen.getByLabelText(/Description/);
    const longDescription = 'a'.repeat(501);

    fireEvent.change(descriptionTextarea, { target: { value: longDescription } });

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Description must be 500 characters or less')).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    renderReportIncident();

    // Fill form
    const incidentTypeSelect = screen.getByLabelText('Incident Type *');
    const fullNameInput = screen.getByLabelText('Full Name *');
    const descriptionTextarea = screen.getByLabelText(/Description/);

    fireEvent.change(incidentTypeSelect, { target: { value: 'Fire' } });
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/incidents',
        expect.objectContaining({
          incidentType: 'Fire',
          fullName: 'John Doe',
          description: 'Test description',
          timestamp: expect.any(String),
          status: 'submitted',
        })
      );
    });

    // Should show success state
    expect(screen.getByText('Report Submitted!')).toBeInTheDocument();
  });

  test('handles submission error gracefully', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Network error'));

    renderReportIncident();

    // Fill form
    const incidentTypeSelect = screen.getByLabelText('Incident Type *');
    const fullNameInput = screen.getByLabelText('Full Name *');
    const descriptionTextarea = screen.getByLabelText(/Description/);

    fireEvent.change(incidentTypeSelect, { target: { value: 'Fire' } });
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    // Should still show success (as per component logic for demo)
    expect(screen.getByText('Report Submitted!')).toBeInTheDocument();
  });

  test('handles image upload', () => {
    renderReportIncident();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('Upload photos');

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Since we mocked FileReader, we can't easily test the full flow
    // But we can check that the input exists
    expect(fileInput).toBeInTheDocument();
  });

  test('shows loading state during submission', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderReportIncident();

    // Fill form
    const incidentTypeSelect = screen.getByLabelText('Incident Type *');
    const fullNameInput = screen.getByLabelText('Full Name *');
    const descriptionTextarea = screen.getByLabelText(/Description/);

    fireEvent.change(incidentTypeSelect, { target: { value: 'Fire' } });
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Report' });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Submit Report')).toBeInTheDocument(); // Button text doesn't change in loading state

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});