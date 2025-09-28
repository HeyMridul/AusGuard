import { useState, useEffect } from 'react';
import { generateAusBoardContent } from '../lib/ausBoardService';
import { AusBoardContent, AustralianFact } from '../types';
import { 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Star, 
  Lightbulb, 
  Heart, 
  Users, 
  Globe, 
  BookOpen,
  Flag,
  MessageCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AusBoard() {
  const [content, setContent] = useState<AusBoardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTriviaAnswer, setShowTriviaAnswer] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadAusBoardContent();
  }, []);

  const loadAusBoardContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const ausBoardContent = await generateAusBoardContent();
      setContent(ausBoardContent);
      setLastRefresh(new Date());
      setShowTriviaAnswer(false);
    } catch (err) {
      console.error('Error loading AusBoard content:', err);
      setError('Failed to load Australian content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'history': return <BookOpen className="h-5 w-5" />;
      case 'geography': return <Globe className="h-5 w-5" />;
      case 'culture': return <Heart className="h-5 w-5" />;
      case 'wildlife': return <Star className="h-5 w-5" />;
      case 'sports': return <Users className="h-5 w-5" />;
      case 'food': return <Heart className="h-5 w-5" />;
      case 'language': return <MessageCircle className="h-5 w-5" />;
      case 'innovation': return <Lightbulb className="h-5 w-5" />;
      case 'nature': return <Star className="h-5 w-5" />;
      case 'people': return <Users className="h-5 w-5" />;
      default: return <Flag className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'history': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'geography': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'culture': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'wildlife': return 'bg-green-100 text-green-700 border-green-200';
      case 'sports': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'food': return 'bg-red-100 text-red-700 border-red-200';
      case 'language': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'innovation': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'nature': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'people': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const FactCard = ({ fact, title, icon }: { fact: AustralianFact; title: string; icon: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(fact.category)}`}>
          {fact.category.toUpperCase()}
        </span>
      </div>

      <h4 className="text-xl font-bold text-gray-900 mb-3">{fact.title}</h4>
      <p className="text-gray-600 mb-4">{fact.content}</p>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Interesting Fact</span>
          </div>
          <p className="text-blue-800 text-sm">{fact.interestingFact}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Did You Know?</span>
          </div>
          <p className="text-green-800 text-sm">{fact.didYouKnow}</p>
        </div>

        {fact.culturalSignificance && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Cultural Significance</span>
            </div>
            <p className="text-purple-800 text-sm">{fact.culturalSignificance}</p>
          </div>
        )}

        {(fact.relatedLocation || fact.state) && (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {fact.relatedLocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{fact.relatedLocation}</span>
              </div>
            )}
            {fact.state && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(fact.difficulty)}`}>
                {fact.state}
              </span>
            )}
          </div>
        )}

        {fact.tags && fact.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fact.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-xl h-64"></div>
            <div className="bg-gray-200 rounded-xl h-64"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Flag className="h-8 w-8 text-green-600" />
            <span>AusBoard</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Discover amazing facts and stories about Australia's rich culture and heritage
          </p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString('en-AU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>
        
        <button
          onClick={loadAusBoardContent}
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Content'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <span>{error}</span>
          <button
            onClick={loadAusBoardContent}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {content && (
        <div className="space-y-8">
          {/* Daily Fact and Weekly Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FactCard 
              fact={content.dailyFact} 
              title="Daily Australian Fact" 
              icon={<Calendar className="h-6 w-6 text-green-600" />} 
            />
            <FactCard 
              fact={content.weeklySpotlight} 
              title="Weekly Spotlight" 
              icon={<Star className="h-6 w-6 text-yellow-600" />} 
            />
          </div>

          {/* Cultural Moment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="h-6 w-6 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cultural Moment</h3>
            </div>
            
            <h4 className="text-xl font-bold text-gray-900 mb-3">{content.culturalMoment.title}</h4>
            <p className="text-gray-600 mb-4">{content.culturalMoment.description}</p>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-pink-900 mb-2">Why This Matters</h5>
              <p className="text-pink-800 text-sm">{content.culturalMoment.significance}</p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Related Facts:</h5>
              <ul className="space-y-1">
                {content.culturalMoment.relatedFacts.map((fact, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fun Trivia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Fun Australian Trivia</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                {content.funTrivia.category}
              </span>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-900 mb-2">Question:</h4>
              <p className="text-yellow-800">{content.funTrivia.question}</p>
            </div>
            
            <button
              onClick={() => setShowTriviaAnswer(!showTriviaAnswer)}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 mb-4"
            >
              {showTriviaAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showTriviaAnswer ? 'Hide Answer' : 'Show Answer'}</span>
            </button>
            
            {showTriviaAnswer && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">Answer:</h5>
                  <p className="text-green-800 font-semibold">{content.funTrivia.answer}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                  <p className="text-blue-800 text-sm">{content.funTrivia.explanation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Australian Slang */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Australian Slang of the Day</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-bold text-blue-600 mb-2">{content.australianism.word}</h4>
                <p className="text-gray-700 mb-3">{content.australianism.meaning}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-1">Example:</h5>
                  <p className="text-blue-800 text-sm italic">"{content.australianism.example}"</p>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Origin:</h5>
                  <p className="text-gray-700 text-sm">{content.australianism.origin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About AusBoard */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Flag className="h-5 w-5 text-green-600" />
          <span>About AusBoard</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Educational</h4>
            <p className="text-gray-600">Learn fascinating facts about Australia's culture, history, and geography</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Fresh Content</h4>
            <p className="text-gray-600">New Australian facts and cultural insights updated regularly</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Cultural Respect</h4>
            <p className="text-gray-600">Content celebrates Australia's diverse cultures with respect and accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
