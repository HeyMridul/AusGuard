import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchWeatherData, fetchAustralianNews, getWeatherDescription, getWeatherIcon } from '../lib/api';
import { analyzeWeatherAndNews } from '../lib/gemini';
import { WeatherData, NewsArticle, GeminiAnalysis } from '../types';
import { Cloud, Thermometer, Wind, Eye, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import AlertContainer from './AlertContainer';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile?.latitude || !profile?.longitude) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData(profile.latitude, profile.longitude),
        fetchAustralianNews(profile.state)
      ]);

      setWeather(weatherData);
      setNews(newsData.slice(0, 4)); // Show top 4 news items

      // Analyze data with Gemini AI
      await analyzeData(weatherData, newsData);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async (weatherData: WeatherData | null, newsData: NewsArticle[]) => {
    try {
      setAnalyzing(true);
      
      const geminiAnalysis = await analyzeWeatherAndNews(
        weatherData,
        newsData,
        { state: profile?.state, suburb: profile?.suburb }
      );
      
      setAnalysis(geminiAnalysis);
    } catch (err) {
      console.error('Error analyzing data with Gemini:', err);
      // Don't show error to user as this is a secondary feature
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (weather || news.length > 0) {
      await analyzeData(weather, news);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {profile?.full_name || user?.email}
        </h1>
        <p className="text-gray-600 mt-2">
          {profile?.suburb ? `${profile.suburb}, ${profile.state} ${profile.postcode}` : 'Location not set'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={loadDashboardData}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!profile?.latitude || !profile?.longitude ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p>Please set your location in your profile to see personalized weather and alerts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Safety Analysis */}
          <AlertContainer 
            analysis={analysis}
            loading={analyzing}
            onRefresh={handleRefreshAnalysis}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Weather</h2>
                <div className="text-2xl">
                  {weather ? getWeatherIcon(weather.current.weathercode) : '🌤️'}
                </div>
              </div>
              
              {weather ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {weather.current.temperature}°C
                    </div>
                    <div className="text-gray-600">
                      {getWeatherDescription(weather.current.weathercode)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{Math.round(weather.current.windspeed)} km/h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{Math.round(weather.current.humidity)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{Math.round(weather.current.visibility)} km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Feels like {Math.round(weather.current.temperature)}°C</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Weather data unavailable
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h2>
              
              {weather ? (
                <div className="space-y-3">
                  {weather.daily.time.map((date, index) => {
                    const day = new Date(date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
                    
                    return (
                      <div key={date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900 w-12">
                            {index === 0 ? 'Today' : day}
                          </span>
                          <div className="text-xl">
                            {getWeatherIcon(weather.daily.weathercode[index])}
                          </div>
                          <span className="text-sm text-gray-600">
                            {getWeatherDescription(weather.daily.weathercode[index])}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-600">
                            {weather.daily.precipitation_probability_max[index]}%
                          </span>
                          <span className="text-gray-500">
                            {weather.daily.temperature_2m_min[index]}°
                          </span>
                          <span className="font-medium text-gray-900">
                            {weather.daily.temperature_2m_max[index]}°
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Forecast data unavailable
                </div>
              )}
            </div>
          </div>

          {/* Recent News */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent News & Alerts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((article, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        article.category === 'emergency' ? 'bg-red-100 text-red-700' :
                        article.category === 'weather' ? 'bg-blue-100 text-blue-700' :
                        article.category === 'health' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {article.category?.toUpperCase() || 'NEWS'}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString('en-AU')}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{article.source.name}</span>
                      <button className="flex items-center text-xs text-blue-600 hover:text-blue-700">
                        Read more
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}