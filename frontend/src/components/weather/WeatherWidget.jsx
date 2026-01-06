import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Eye, Thermometer, CloudDrizzle, CloudFog } from 'lucide-react';
import { formatDate, getWeatherIcon, mockWeatherData } from '../../utils/helpers';

const WeatherWidget = ({ lat = 13.0293, lon = 123.445 }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const iconComponents = {
    clear: Sun,
    clouds: Cloud,
    rain: CloudRain,
    drizzle: CloudDrizzle,
    thunderstorm: CloudLightning,
    snow: CloudSnow,
    mist: CloudFog,
  };

  useEffect(() => {
    // Use mock data for demo
    setCurrentWeather(mockWeatherData.current);

    // Process forecast to get one entry per day
    const dailyForecast = [];
    const seenDates = new Set();

    for (const item of mockWeatherData.forecast.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!seenDates.has(date) && dailyForecast.length < 5) {
        seenDates.add(date);
        dailyForecast.push(item);
      }
    }

    setForecast(dailyForecast);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 animate-pulse">
        <div className="h-16 bg-white/30 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
        <p className="text-white/80 text-xs text-center">{error}</p>
      </div>
    );
  }

  const weatherType = getWeatherIcon(currentWeather?.weather?.[0]?.id || 800);
  const WeatherIcon = iconComponents[weatherType] || Sun;
  const tempC = Math.round(currentWeather?.main?.temp || 0);
  const tempF = Math.round((tempC * 9 / 5) + 32);
  const feelsLike = Math.round(currentWeather?.main?.feels_like || 0);

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20 animate-slide-down">
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/30 rounded-lg">
            <WeatherIcon className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{tempC}°C</p>
            <p className="text-xs text-white/80">{tempF}°F</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-white">{currentWeather?.name}</p>
          <p className="text-[10px] text-white/80 capitalize">{currentWeather?.weather?.[0]?.description}</p>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-4 gap-1">
        <div className="flex flex-col items-center p-1 bg-white/10 rounded">
          <Thermometer className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/60">Feels</span>
          <span className="text-xs font-semibold text-white">{feelsLike}°</span>
        </div>
        <div className="flex flex-col items-center p-1 bg-white/10 rounded">
          <Droplets className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/60">Humidity</span>
          <span className="text-xs font-semibold text-white">{currentWeather?.main?.humidity}%</span>
        </div>
        <div className="flex flex-col items-center p-1 bg-white/10 rounded">
          <Wind className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/60">Wind</span>
          <span className="text-xs font-semibold text-white">{Math.round(currentWeather?.wind?.speed || 0)}m/s</span>
        </div>
        <div className="flex flex-col items-center p-1 bg-white/10 rounded">
          <Eye className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/60">Vis</span>
          <span className="text-xs font-semibold text-white">{Math.round((currentWeather?.visibility || 0) / 1000)}km</span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="border-t border-white/20">
        <div className="flex justify-between">
          {forecast.map((day, index) => {
            const dayWeatherType = getWeatherIcon(day.weather?.[0]?.id || 800);
            const DayIcon = iconComponents[dayWeatherType] || Sun;
            return (
              <div key={index} className="flex flex-col items-center">
                <span className="text-[10px] text-white/60">{formatDate(day.dt, 'short')}
                <DayIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-semibold text-white">{Math.round(day.main.temp)}°</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;