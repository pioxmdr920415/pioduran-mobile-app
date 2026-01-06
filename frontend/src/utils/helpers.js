// Get background image based on time of day
export const getTimeBasedBackground = () => {
  const hour = new Date().getHours();

  // p1: Early morning (5-7)
  // p2: Morning (7-10)
  // p3: Midday (10-15) - bright sunny
  // p4: Sunset (15-18) 
  // p5: Night (18-5)

  if (hour >= 5 && hour < 7) return '/background/p1.jpeg';
  if (hour >= 7 && hour < 10) return '/background/p2.jpeg';
  if (hour >= 10 && hour < 15) return '/background/p3.jpeg';
  if (hour >= 15 && hour < 18) return '/background/p4.jpeg';
  return '/background/p5.jpeg';
};

// Format date
export const formatDate = (timestamp, format = 'short') => {
  const date = new Date(timestamp * 1000);
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get weather icon based on condition code
export const getWeatherIcon = (code) => {
  if (code >= 200 && code < 300) return 'thunderstorm';
  if (code >= 300 && code < 400) return 'drizzle';
  if (code >= 500 && code < 600) return 'rain';
  if (code >= 600 && code < 700) return 'snow';
  if (code >= 700 && code < 800) return 'mist';
  if (code === 800) return 'clear';
  if (code > 800) return 'clouds';
  return 'clear';
};

// Emergency hotline data
export const emergencyHotlines = [
  { name: 'MDRMMO', number: '0917-772-5016', description: 'Municipal Disaster Risk Reduction Management Office', logo: '/images/logo.webp' },
  { name: 'MDRMMO', number: '0966-395-6804', description: 'Municipal Disaster Risk Reduction Management Office', logo: '/images/logo.webp' },
  { name: 'PSO', number: '0946-743-2735', description: 'Public Safety Officer', logo: '/images/logo.webp' },
  { name: 'Mayor\'s Office', number: '0961-690-2026', description: 'Mayor\'s Office', logo: '/images/logo.webp' },
  { name: 'Mayor\'s Office', number: '0995-072-9306', description: 'Mayor\'s Office', logo: '/images/logo.webp' },
  { name: 'MSWDO', number: '0910-122-8971', description: 'Municipal Social Welfare and Development Office', logo: '/images/logo.webp' },
  { name: 'MSWDO', number: '0919-950-9515', description: 'Municipal Social Welfare and Development Office', logo: '/images/logo.webp' },
  { name: 'BFP', number: '0949-889-7134', description: 'Bureau of Fire Protection - Pio Duran Fire Station', logo: '/images/logo.webp' },
  { name: 'BFP', number: '0931-929-3408', description: 'Bureau of Fire Protection - Pio Duran Fire Station', logo: '/images/logo.webp' },
  { name: 'PNP', number: '0998-598-5946', description: 'Philippine National Police - Pio Duran MPS', logo: '/images/logo.webp' },
  { name: 'MARITIME POLICE', number: '0917-500-2325', description: 'Maritime Police', logo: '/images/logo.webp' },
  { name: 'BJMP', number: '0936-572-9067', description: 'Bureau of Jail Management and Penology', logo: '/images/logo.webp' },
  { name: 'PCG', number: '0970-667-5457', description: 'Philippine Coast Guard - Pio Duran Sub Station', logo: '/images/logo.webp' },
  { name: 'RHU', number: '0927-943-4663', description: 'Rural Health Unit Pio Duran', logo: '/images/logo.webp' },
  { name: 'RHU', number: '0907-640-7701', description: 'Rural Health Unit Pio Duran', logo: '/images/logo.webp' },
  { name: 'PDMDH', number: '0985-317-1769', description: 'Pio Duran Memorial District Hospital', logo: '/images/logo.webp' },
];

// Incident types
export const incidentTypes = [
  'Fire',
  'Flood',
  'Earthquake',
  'Typhoon',
  'Landslide',
  'Storm Surge',
  'Vehicular Accident',
  'Medical Emergency',
  'Crime/Security',
  'Missing Person',
  'Other'
];

// Mock typhoon data for demo
export const mockTyphoonData = {
  current: {
    name: 'Typhoon Rolly',
    category: 'Severe Tropical Storm',
    as_of: '5:00 A.M. - 12/13/2024',
    near_location: '100 km of east samar',
    windSpeed: 165, // km/h
    pressure: 965, // hPa
    location: { lat: 13.5, lon: 124.0 },
    direction: 'Northwest',
    speed: 25, // km/h
    status: 'active',
    lastUpdate: new Date().toISOString(),
    description: 'Typhoon Rolly is currently intensifying as it moves northwest across the Philippine Sea.',
    affectedAreas: ['Albay', 'Camarines Sur', 'Camarines Norte', 'Catanduanes', 'Sorsogon'],
    warnings: [
      'Signal No. 3: Catanduanes, Camarines Norte, Camarines Sur, Albay, Sorsogon',
      'Signal No. 2: Quezon, Laguna, Batangas, Rizal, Metro Manila',
      'Signal No. 1: Bulacan, Nueva Ecija, Pampanga, Bataan, Cavite'
    ],
    preparedness: [
      'Secure loose objects and outdoor furniture',
      'Stay indoors and away from windows',
      'Prepare emergency kits with food, water, and medications',
      'Monitor official weather updates',
      'Follow evacuation orders if issued'
    ],
    // Tracking data for the chart
    trackingPath: [
      { lat: 12.0, lon: 126.0, x: 10, y: 80, time: '12:00 PM' },
      { lat: 12.5, lon: 125.5, x: 20, y: 70, time: '1:00 PM' },
      { lat: 13.0, lon: 125.0, x: 30, y: 60, time: '2:00 PM' },
      { lat: 13.2, lon: 124.5, x: 45, y: 50, time: '3:00 PM' },
      { lat: 13.5, lon: 124.0, x: 60, y: 40, time: '4:00 PM' },
      { lat: 13.8, lon: 123.5, x: 75, y: 30, time: '5:00 PM' },
      { lat: 14.0, lon: 123.0, x: 85, y: 20, time: '6:00 PM' }
    ],
    totalDistance: 450, // km
    trackingTime: 6 // hours
  },
  forecast: [
    {
      time: '6 hours',
      windSpeed: 175,
      pressure: 955,
      location: { lat: 14.2, lon: 123.8 },
      intensity: 'Category 3'
    },
    {
      time: '12 hours',
      windSpeed: 185,
      pressure: 945,
      location: { lat: 15.0, lon: 123.5 },
      intensity: 'Category 3'
    },
    {
      time: '24 hours',
      windSpeed: 155,
      pressure: 970,
      location: { lat: 16.5, lon: 122.8 },
      intensity: 'Category 2'
    }
  ],
  historical: [
    {
      name: 'Typhoon Ulysses',
      year: 2020,
      category: 'Category 4',
      damage: '₱20.7B',
      fatalities: 47
    },
    {
      name: 'Typhoon Vamco',
      year: 2020,
      category: 'Category 3',
      damage: '₱7.8B',
      fatalities: 89
    },
    {
      name: 'Typhoon Karding',
      year: 2024,
      category: 'Category 2',
      damage: '₱1.2B',
      fatalities: 12
    }
  ]
};

// Mock weather data for demo
export const mockWeatherData = {
  current: {
    name: 'Pio Duran',
    main: {
      temp: 28,
      feels_like: 32,
      humidity: 78,
      pressure: 1012
    },
    weather: [
      {
        id: 801,
        main: 'Clouds',
        description: 'few clouds',
        icon: '02d'
      }
    ],
    wind: {
      speed: 3.5,
      deg: 180
    },
    visibility: 10000,
    dt: Math.floor(Date.now() / 1000)
  },
  forecast: {
    list: [
      {
        dt: Math.floor(Date.now() / 1000) + 86400, // tomorrow
        main: {
          temp: 29,
          feels_like: 33,
          humidity: 75
        },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
        wind: { speed: 2.5 }
      },
      {
        dt: Math.floor(Date.now() / 1000) + 2 * 86400, // day after
        main: {
          temp: 27,
          feels_like: 31,
          humidity: 80
        },
        weather: [{ id: 500, main: 'Rain', description: 'light rain' }],
        wind: { speed: 4.0 }
      },
      {
        dt: Math.floor(Date.now() / 1000) + 3 * 86400,
        main: {
          temp: 26,
          feels_like: 30,
          humidity: 85
        },
        weather: [{ id: 501, main: 'Rain', description: 'moderate rain' }],
        wind: { speed: 5.5 }
      },
      {
        dt: Math.floor(Date.now() / 1000) + 4 * 86400,
        main: {
          temp: 30,
          feels_like: 34,
          humidity: 70
        },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
        wind: { speed: 3.0 }
      },
      {
        dt: Math.floor(Date.now() / 1000) + 5 * 86400,
        main: {
          temp: 31,
          feels_like: 35,
          humidity: 65
        },
        weather: [{ id: 801, main: 'Clouds', description: 'few clouds' }],
        wind: { speed: 2.8 }
      }
    ]
  }
};

// Mock weather alerts
export const mockWeatherAlerts = [
  {
    id: 1,
    type: 'typhoon',
    severity: 'high',
    title: 'Typhoon Rolly Signal No. 3',
    message: 'Catanduanes under Signal No. 3. Expect very strong winds and heavy rainfall.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    location: 'Catanduanes'
  },
  {
    id: 2,
    type: 'flood',
    severity: 'medium',
    title: 'Flash Flood Warning',
    message: 'Possible flash floods in low-lying areas due to heavy rainfall.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    location: 'Albay'
  },
  {
    id: 3,
    type: 'landslide',
    severity: 'high',
    title: 'Landslide Alert',
    message: 'High risk of landslides in mountainous areas. Evacuate immediately.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    location: 'Sorsogon'
  }
];
