import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchAustralianNews } from '../lib/api';
import { NewsArticle } from '../types';
import { RefreshCw, ExternalLink, Clock, AlertTriangle, Filter } from 'lucide-react';

export default function News() {
  const { profile } = useAuth();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'weather' | 'health' | 'general'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadNews();
  }, [profile?.state]);

  useEffect(() => {
    filterNews();
  }, [news, filter]);

  const loadNews = async () => {
    try {
      const isRefresh = !loading;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      const newsData = await fetchAustralianNews(profile?.state);
      setNews(newsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterNews = () => {
    if (filter === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(article => article.category === filter));
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'weather': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'health': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'weather': return '🌤️';
      case 'health': return '🏥';
      default: return '📰';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-AU');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Alerts</h1>
          <p className="text-gray-600 mt-1">
            Latest Australian news and emergency updates
            {profile?.state && profile.state !== 'NSW' && (
              <span className="ml-2 text-blue-600 font-medium">
                • Focused on {profile.state}
              </span>
            )}
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString('en-AU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>
        
        <button
          onClick={loadNews}
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

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All News', count: news.length },
            { key: 'emergency', label: 'Emergency', count: news.filter(n => n.category === 'emergency').length },
            { key: 'weather', label: 'Weather', count: news.filter(n => n.category === 'weather').length },
            { key: 'health', label: 'Health', count: news.filter(n => n.category === 'health').length },
            { key: 'general', label: 'General', count: news.filter(n => n.category === 'general').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-6">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {filter !== 'all' 
                ? 'Try selecting a different category'
                : 'No news articles available at the moment'
              }
            </p>
          </div>
        ) : (
          filteredNews.map((article, index) => (
            <article
              key={index}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow duration-200 ${
                article.category === 'emergency' ? 'border-l-red-500' :
                article.category === 'weather' ? 'border-l-blue-500' :
                article.category === 'health' ? 'border-l-green-500' :
                'border-l-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getCategoryIcon(article.category)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(article.category)}`}>
                    {article.category?.toUpperCase() || 'NEWS'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                    {article.title}
                  </h2>
                  
                  {article.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Source: <span className="font-medium">{article.source.name}</span>
                    </div>
                    
                    <button
                      onClick={() => window.open(article.url, '_blank')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      <span>Read full article</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {article.urlToImage && (
                  <div className="md:col-span-1">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-32 md:h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Emergency Information */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🚨</div>
          <h3 className="text-lg font-semibold text-red-800">Emergency Information</h3>
        </div>
        <div className="text-red-700 space-y-2">
          <p><strong>Emergency Services:</strong> 000</p>
          <p><strong>Police Assistance Line:</strong> 131 444</p>
          <p><strong>Poison Information Centre:</strong> 13 11 26</p>
          <p><strong>Crisis Support:</strong> 13 11 14 (Lifeline)</p>
        </div>
      </div>
    </div>
  );
}