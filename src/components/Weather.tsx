import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchWeatherData, getWeatherDescription, getWeatherIcon } from '../lib/api';
import { WeatherData } from '../types';
import { RefreshCw, AlertTriangle, Wind, Eye, Droplets, Thermometer } from 'lucide-react';
import WeatherSuggestions from './WeatherSuggestions';

export default function Weather() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [profile]);

  const loadWeatherData = async () => {
    if (!profile?.latitude || !profile?.longitude) {
      setError('Location not available. Please set your location in your profile.');
      setLoading(false);
      return;
    }

    try {
      const isRefresh = !loading;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      const weatherData = await fetchWeatherData(profile.latitude, profile.longitude);
      setWeather(weatherData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSeverityColor = (code: number) => {
    if ([95, 96, 99].includes(code)) return 'bg-red-100 text-red-700 border-red-200';
    if ([61, 63, 65].includes(code)) return 'bg-orange-100 text-orange-700 border-orange-200';
    if ([51, 53, 55].includes(code)) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-200 rounded-xl h-64"></div>
            <div className="lg:col-span-2 bg-gray-200 rounded-xl h-64"></div>
          </div>
          <div className="bg-gray-200 rounded-xl h-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather</h1>
          <p className="text-gray-600 mt-1">
            {profile?.suburb ? `${profile.suburb}, ${profile.state}` : 'Current location'}
          </p>
        </div>
        
        <button
          onClick={loadWeatherData}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Weather Suggestions */}
      {weather && (
        <WeatherSuggestions weatherData={weather} />
      )}

      {weather && (
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {getWeatherIcon(weather.current.weathercode)}
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {weather.current.temperature}°C
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {getWeatherDescription(weather.current.weathercode)}
                </div>
                
                {lastUpdated && (
                  <div className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString('en-AU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Weather Details */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Conditions</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Wind className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(weather.current.windspeed)}</div>
                  <div className="text-sm text-gray-600">km/h</div>
                  <div className="text-xs text-gray-500">Wind Speed</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-50 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(weather.current.humidity)}</div>
                  <div className="text-sm text-gray-600">%</div>
                  <div className="text-xs text-gray-500">Humidity</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-50 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(weather.current.visibility)}</div>
                  <div className="text-sm text-gray-600">km</div>
                  <div className="text-xs text-gray-500">Visibility</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-50 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Thermometer className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(weather.current.winddirection)}</div>
                  <div className="text-sm text-gray-600">°</div>
                  <div className="text-xs text-gray-500">Wind Direction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Status</h2>
            
            <div className={`border rounded-lg p-4 ${getSeverityColor(weather.current.weathercode)}`}>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getWeatherIcon(weather.current.weathercode)}
                </div>
                <div>
                  <div className="font-semibold">
                    {getWeatherDescription(weather.current.weathercode)}
                  </div>
                  <div className="text-sm opacity-90">
                    Current weather conditions for your area
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Forecast */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">7-Day Forecast</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weather.daily.time.map((date, index) => {
                const day = new Date(date);
                const isToday = index === 0;
                
                return (
                  <div key={date} className="text-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="font-medium text-gray-900 mb-2">
                      {isToday ? 'Today' : day.toLocaleDateString('en-AU', { weekday: 'short' })}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {day.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </div>
                    
                    <div className="text-3xl mb-3">
                      {getWeatherIcon(weather.daily.weathercode[index])}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900">
                        {weather.daily.temperature_2m_max[index]}°
                      </div>
                      <div className="text-sm text-gray-600">
                        {weather.daily.temperature_2m_min[index]}°
                      </div>
                      <div className="text-xs text-blue-600">
                        {weather.daily.precipitation_probability_max[index]}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}