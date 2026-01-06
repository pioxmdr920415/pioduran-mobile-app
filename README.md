# Emergency Response System

A comprehensive emergency response and disaster management application built with React frontend and Python backend.

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Project Overview

This application provides:
- Real-time disaster monitoring and alerts
- Emergency incident reporting with geotagging
- Typhoon tracking and dashboard
- Emergency contact management
- Weather widget integration
- AI-powered emergency assistance
- Support resources and guidelines

## Prerequisites

Before you begin, ensure you have installed:

### For Backend (Python)
- **Python 3.8 or higher**
- **pip** (Python package installer)

### For Frontend (React)
- **Node.js 16.0.0 or higher**
- **npm 7.0.0 or higher** (or **yarn**)
- **Git** (for version control)

### Optional Development Tools
- **Docker** (for containerized development)
- **VS Code** with recommended extensions (see `.vscode/`)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd emergency-response-system
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
# OR if using yarn:
# yarn install
```

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
python server.py
```

The backend server will start on `http://localhost:5000` by default.

#### Start Frontend Development Server

In a new terminal window:

```bash
cd frontend
npm start
# OR if using yarn:
# yarn start
```

The frontend will start on `http://localhost:3000` by default.

### Production Build

#### Build Frontend for Production

```bash
cd frontend
npm run build
# OR if using yarn:
# yarn build
```

#### Serve the Application

After building, you can serve the application using:

```bash
cd frontend
npm run preview
# OR if using yarn:
# yarn preview
```

## Project Structure

```
emergency-response-system/
├── backend/                 # Python backend server
│   ├── server.py           # Main server file
│   ├── auth.py             # Authentication logic
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── contexts/      # React contexts
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── .env               # Frontend environment variables
├── tests/                 # Test files
└── README.md             # This file
```

## Features

### Emergency Management
- **Real-time Alerts**: Receive and manage emergency notifications
- **Incident Reporting**: Report incidents with geolocation and media
- **Typhoon Tracking**: Monitor typhoon movements and impact areas
- **Emergency Contacts**: Quick access to emergency services

### User Experience
- **Weather Widget**: Current weather conditions
- **AI Assistant**: AI-powered emergency guidance
- **Disaster Guidelines**: Preparedness and response information
- **Accessibility**: Features for users with disabilities

### Technical Features
- **Offline Support**: Works with limited connectivity
- **Geotagging**: GPS location tagging for reports
- **Camera Integration**: Capture and upload images
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Python** - Programming language
- **Flask** - Web framework
- **SQLite** - Database (default)
- **JWT** - Authentication

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Leaflet** - Maps and geolocation
- **React Router** - Navigation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Testing framework

## Development

### Environment Variables

#### Backend (.env)
```env
FLASK_APP=server.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_WEATHER_API_KEY=your-weather-api-key
```

### Adding New Features

1. **Backend**: Create new routes in `server.py` or add modules in `backend/`
2. **Frontend**: Add components in `frontend/src/components/` or pages in `frontend/src/pages/`
3. **API Integration**: Add services in `frontend/src/services/`
4. **Testing**: Write tests in `tests/` directory

### Code Style

- Follow existing code patterns
- Use TypeScript for type safety
- Maintain consistent naming conventions
- Write clear, descriptive commit messages

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # For frontend
lsof -i :5000  # For backend

# Kill the process if needed
kill -9 <PID>
```

#### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Python Dependencies Issues
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### CORS Issues
Ensure your backend allows requests from your frontend origin by checking the CORS configuration in `backend/server.py`.

### Getting Help

1. Check the [Issues](https://github.com/your-repo/issues) section
2. Review the [Wiki](https://github.com/your-repo/wiki) for detailed guides
3. Join our [Discord](https://discord.gg/your-server) community
4. Create a new issue if you can't find a solution

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@emergencyapp.com
- Visit our documentation site

---

**Note**: This application is designed for emergency response and disaster management. Ensure you test thoroughly before deployment in production environments.
# pioduran-mobile-app
# pioduran-mobile-app
