import { useState, useEffect } from 'react';
import { generateWeatherSuggestions } from '../lib/weatherSuggestions';
import { WeatherData, WeatherRecommendations } from '../types';
import { 
  RefreshCw, 
  Umbrella, 
  Shirt, 
  Activity, 
  AlertTriangle, 
  Sparkles,
  Sun,
  Wind,
  Droplets,
  Eye,
  EyeOff,
  CheckCircle,
  Info
} from 'lucide-react';

interface WeatherSuggestionsProps {
  weatherData: WeatherData;
}

export default function WeatherSuggestions({ weatherData }: WeatherSuggestionsProps) {
  const [recommendations, setRecommendations] = useState<WeatherRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'clothing']));

  useEffect(() => {
    loadWeatherSuggestions();
  }, [weatherData]);

  const loadWeatherSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const weatherRecommendations = await generateWeatherSuggestions(weatherData);
      setRecommendations(weatherRecommendations);
    } catch (err) {
      console.error('Error loading weather suggestions:', err);
      setError('Failed to load weather suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenging': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return '😊';
      case 'good': return '😌';
      case 'fair': return '🤔';
      case 'challenging': return '😅';
      default: return '😐';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'precaution': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity': return <Sparkles className="h-4 w-4" />;
      case 'clothing': return <Shirt className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const SuggestionCard = ({ suggestion, showIcon = true }: { suggestion: any; showIcon?: boolean }) => (
    <div className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {getTypeIcon(suggestion.type)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{suggestion.emoji}</span>
            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
              {suggestion.priority}
            </span>
          </div>
          <p className="text-gray-700 text-sm">{suggestion.description}</p>
          {suggestion.actionable && (
            <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Actionable advice</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-blue-200 rounded w-1/3"></div>
          <div className="h-4 bg-blue-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-blue-200 rounded"></div>
            <div className="h-20 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={loadWeatherSuggestions}
            className="text-red-600 hover:text-red-800 underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Sun className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Weather Recommendations</h2>
            <p className="text-sm text-gray-600">Personalized suggestions for today's weather</p>
          </div>
        </div>
        
        <button
          onClick={loadWeatherSuggestions}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overall Mood */}
      <div className={`mb-4 p-3 rounded-lg border ${getMoodColor(recommendations.overallMood)}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getMoodIcon(recommendations.overallMood)}</span>
          <span className="font-medium">Overall Mood: {recommendations.overallMood.charAt(0).toUpperCase() + recommendations.overallMood.slice(1)}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('summary')}
          className="flex items-center space-x-2 text-left w-full"
        >
          <h3 className="font-semibold text-gray-900">Daily Summary</h3>
          {expandedSections.has('summary') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {expandedSections.has('summary') && (
          <p className="mt-2 text-gray-700">{recommendations.summary}</p>
        )}
      </div>

      {/* Umbrella & Clothing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Umbrella Recommendation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Umbrella className={`h-5 w-5 ${recommendations.umbrellaNeeded ? 'text-blue-600' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900">Umbrella</h3>
          </div>
          <p className={`text-sm ${recommendations.umbrellaNeeded ? 'text-blue-700' : 'text-gray-600'}`}>
            {recommendations.umbrellaNeeded ? 'Yes, bring an umbrella today!' : 'No umbrella needed today.'}
          </p>
        </div>

        {/* Clothing Advice */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Shirt className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Clothing</h3>
          </div>
          <p className="text-sm text-gray-700">{recommendations.clothingAdvice}</p>
        </div>
      </div>

      {/* Activity Suggestions */}
      {recommendations.activitySuggestions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('activities')}
            className="flex items-center space-x-2 text-left w-full mb-2"
          >
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Activity Suggestions</h3>
            {expandedSections.has('activities') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {expandedSections.has('activities') && (
            <div className="space-y-3">
              {recommendations.activitySuggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Precautions */}
      {recommendations.precautions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('precautions')}
            className="flex items-center space-x-2 text-left w-full mb-2"
          >
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Important Precautions</h3>
            {expandedSections.has('precautions') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {expandedSections.has('precautions') && (
            <div className="space-y-3">
              {recommendations.precautions.map((precaution) => (
                <SuggestionCard key={precaution.id} suggestion={precaution} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunities */}
      {recommendations.opportunities.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('opportunities')}
            className="flex items-center space-x-2 text-left w-full mb-2"
          >
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Weather Opportunities</h3>
            {expandedSections.has('opportunities') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {expandedSections.has('opportunities') && (
            <div className="space-y-3">
              {recommendations.opportunities.map((opportunity) => (
                <SuggestionCard key={opportunity.id} suggestion={opportunity} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Confidence: {Math.round(recommendations.confidence * 100)}%</span>
          <span>Generated: {new Date(recommendations.generatedAt).toLocaleTimeString('en-AU')}</span>
        </div>
      </div>
    </div>
  );
}
