import axios from 'axios';
import { authAPI, incidentAPI, statusAPI, weatherAPI } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete global.window.location;
global.window.location = { href: '' };

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('authAPI', () => {
    test('register makes correct API call', async () => {
      const userData = { username: 'testuser', password: 'testpass', email: 'test@example.com' };
      const mockResponse = { data: { message: 'User registered successfully' } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await authAPI.register(userData);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    test('login makes correct API call', async () => {
      const credentials = { username: 'testuser', password: 'testpass' };
      const mockResponse = { data: { access_token: 'token123', token_type: 'bearer' } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await authAPI.login(credentials);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    test('getCurrentUser makes correct API call', async () => {
      const mockResponse = { data: { username: 'testuser', role: 'user' } };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await authAPI.getCurrentUser();

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('incidentAPI', () => {
    test('create makes correct API call', async () => {
      const reportData = {
        incidentType: 'Fire',
        fullName: 'John Doe',
        description: 'Test incident',
        timestamp: '2023-01-01T00:00:00Z',
        status: 'submitted'
      };
      const mockResponse = { data: { id: '123', ...reportData } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await incidentAPI.create(reportData);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/incidents', reportData);
      expect(result).toEqual(mockResponse.data);
    });

    test('getAll makes correct API call with filters', async () => {
      const filters = { status: 'submitted', priority: 'high' };
      const mockResponse = { data: [{ id: '123', incidentType: 'Fire' }] };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await incidentAPI.getAll(filters);

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/incidents', { params: filters });
      expect(result).toEqual(mockResponse.data);
    });

    test('getById makes correct API call', async () => {
      const reportId = '123';
      const mockResponse = { data: { id: reportId, incidentType: 'Fire' } };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await incidentAPI.getById(reportId);

      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/incidents/${reportId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('update makes correct API call', async () => {
      const reportId = '123';
      const updateData = { status: 'resolved', notes: 'Fixed' };
      const mockResponse = { data: { id: reportId, status: 'resolved' } };
      mockedAxios.create().put.mockResolvedValue(mockResponse);

      const result = await incidentAPI.update(reportId, updateData);

      expect(mockedAxios.create().put).toHaveBeenCalledWith(`/incidents/${reportId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });

    test('delete makes correct API call', async () => {
      const reportId = '123';
      const mockResponse = { data: { message: 'Report deleted successfully' } };
      mockedAxios.create().delete.mockResolvedValue(mockResponse);

      const result = await incidentAPI.delete(reportId);

      expect(mockedAxios.create().delete).toHaveBeenCalledWith(`/incidents/${reportId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('getUserReports makes correct API call', async () => {
      const userId = 'user123';
      const mockResponse = { data: [{ id: '123', fullName: userId }] };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await incidentAPI.getUserReports(userId);

      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/incidents/user/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('statusAPI', () => {
    test('create makes correct API call', async () => {
      const statusData = { client_name: 'Test Client' };
      const mockResponse = { data: { id: '123', client_name: 'Test Client' } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await statusAPI.create(statusData);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/status', statusData);
      expect(result).toEqual(mockResponse.data);
    });

    test('getAll makes correct API call', async () => {
      const mockResponse = { data: [{ id: '123', client_name: 'Test Client' }] };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await statusAPI.getAll();

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/status');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('weatherAPI', () => {
    beforeEach(() => {
      process.env.REACT_APP_OPENWEATHER_API_KEY = 'test-api-key';
    });

    test('getCurrentWeather makes correct API call', async () => {
      const lat = 14.6760;
      const lon = 121.0437;
      const mockResponse = { data: { weather: [{ main: 'Clear' }], main: { temp: 30 } } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await weatherAPI.getCurrentWeather(lat, lon);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=test-api-key&units=metric`
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('getWeatherForecast makes correct API call', async () => {
      const lat = 14.6760;
      const lon = 121.0437;
      const mockResponse = { data: { list: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await weatherAPI.getWeatherForecast(lat, lon);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=test-api-key&units=metric`
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('throws error when API key is not configured', async () => {
      delete process.env.REACT_APP_OPENWEATHER_API_KEY;

      await expect(weatherAPI.getCurrentWeather(14.6760, 121.0437)).rejects.toThrow(
        'OpenWeather API key not configured'
      );
    });
  });

  describe('axios interceptors', () => {
    test('request interceptor adds auth token when available', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const mockResponse = { data: {} };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      await authAPI.getCurrentUser();

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/auth/me', {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      });
    });

    test('response interceptor handles 401 errors', async () => {
      const error = {
        response: { status: 401 },
      };
      mockedAxios.create().get.mockRejectedValue(error);

      localStorageMock.getItem.mockReturnValue('test-token');

      await expect(authAPI.getCurrentUser()).rejects.toThrow();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(global.window.location.href).toBe('/login');
    });
  });
});