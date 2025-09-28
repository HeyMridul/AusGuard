import { useState, useEffect } from 'react';
import { generateAusKidsStory, AUSKIDS_THEMES } from '../lib/ausKidsService';
import { AusKidsTheme, AusKidsStory, AusKidsStoryRequest } from '../types';
import { 
  BookOpen, 
  Wand2, 
  Users, 
  Clock, 
  Lightbulb, 
  Heart, 
  MapPin,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  Palette,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AusKids() {
  const [selectedTheme, setSelectedTheme] = useState<AusKidsTheme | null>(null);
  const [userTitle, setUserTitle] = useState('');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [story, setStory] = useState<AusKidsStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'themes' | 'story-form' | 'story-display'>('themes');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['content', 'cultural-facts']));

  const ageGroups = [
    { value: '3-5', label: 'Ages 3-5', description: 'Simple stories with basic concepts' },
    { value: '6-8', label: 'Ages 6-8', description: 'Engaging stories with more detail' },
    { value: '9-12', label: 'Ages 9-12', description: 'Complex stories with deeper themes' },
    { value: 'all', label: 'All Ages', description: 'Stories suitable for everyone' }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleThemeSelect = (theme: AusKidsTheme) => {
    setSelectedTheme(theme);
    setCurrentView('story-form');
    setStory(null);
    setUserTitle('');
  };

  const handleBackToThemes = () => {
    setCurrentView('themes');
    setSelectedTheme(null);
    setStory(null);
    setUserTitle('');
  };

  const handleBackToForm = () => {
    setCurrentView('story-form');
    setStory(null);
  };

  const handleGenerateStory = async () => {
    if (!selectedTheme || !userTitle.trim()) {
      setError('Please select a theme and enter a story title.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: AusKidsStoryRequest = {
        theme: selectedTheme.id,
        userTitle: userTitle.trim(),
        ageGroup
      };

      const generatedStory = await generateAusKidsStory(request);
      setStory(generatedStory);
      setCurrentView('story-display');
    } catch (err) {
      console.error('Error generating story:', err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
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

  const getAgeGroupColor = (age: string) => {
    switch (age) {
      case '3-5': return 'bg-pink-100 text-pink-700';
      case '6-8': return 'bg-blue-100 text-blue-700';
      case '9-12': return 'bg-purple-100 text-purple-700';
      case 'all': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ThemeCard = ({ theme }: { theme: AusKidsTheme }) => (
    <div 
      className={`${theme.color} border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
      onClick={() => handleThemeSelect(theme)}
    >
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-4xl">{theme.emoji}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{theme.name}</h3>
          <p className="text-gray-700">{theme.description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-900">Cultural Focus:</span>
          <p className="text-sm text-gray-700">{theme.culturalFocus}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-900">Example Topics:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {theme.exampleTopics.map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded-full">
                {topic}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(theme.ageGroup)}`}>
            {theme.ageGroup === 'all' ? 'All Ages' : `Ages ${theme.ageGroup}`}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-2 text-sm font-medium">
        <Wand2 className="h-4 w-4" />
        <span>Create Story</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );

  if (currentView === 'themes') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span>AusKids</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create magical stories about Australia! Choose a theme, add your own title, 
            and let our AI create educational stories that teach kids about Australian culture, 
            wildlife, and traditions.
          </p>
        </div>

        {/* Age Group Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Select Age Group</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {ageGroups.map((age) => (
              <button
                key={age.value}
                onClick={() => setAgeGroup(age.value)}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  ageGroup === age.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-gray-900">{age.label}</div>
                  <div className="text-sm text-gray-600">{age.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUSKIDS_THEMES.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>

        {/* About AusKids */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">About AusKids Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Educational & Fun</h4>
              <p className="text-gray-600 text-sm">Stories that teach meaningful facts about Australia while entertaining young minds</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Visual Inspiration</h4>
              <p className="text-gray-600 text-sm">Each story includes visual suggestions perfect for illustrations and creativity</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cultural Respect</h4>
              <p className="text-gray-600 text-sm">Stories celebrate Australian diversity with respect and accuracy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'story-form') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleBackToThemes}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Themes</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{selectedTheme?.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedTheme?.name}</h1>
              <p className="text-gray-600">{selectedTheme?.description}</p>
            </div>
          </div>
        </div>

        {/* Story Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story Title
              </label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                placeholder="e.g., 'Kangaroo Jack's Adventure' or 'The Magic Billabong'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be the starting point for your story. Be creative!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ageGroups.map((age) => (
                  <button
                    key={age.value}
                    onClick={() => setAgeGroup(age.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                      ageGroup === age.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{age.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleGenerateStory}
                disabled={loading || !userTitle.trim()}
                className="flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Creating Your Story...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Generate Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'story-display' && story) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToForm}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Create Another Story</span>
          </button>
          
          <button
            onClick={handleBackToThemes}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Back to Themes
          </button>
        </div>

        {/* Story Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{selectedTheme?.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
              <p className="text-gray-600">{selectedTheme?.name} Story</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(story.difficulty)}`}>
              {story.difficulty.charAt(0).toUpperCase() + story.difficulty.slice(1)} Level
            </span>
            <span className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              <Clock className="h-4 w-4" />
              <span>{story.readingTime}</span>
            </span>
            <span className={`px-3 py-1 rounded-full font-medium ${getAgeGroupColor(ageGroup)}`}>
              {ageGroup === 'all' ? 'All Ages' : `Ages ${ageGroup}`}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <div className="space-y-6">
          {/* Main Story */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">The Story</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {story.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Cultural Facts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Did You Know?</h2>
            </div>
            <div className="space-y-3">
              {story.culturalFacts.map((fact, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800">{fact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Moral Lesson */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">What We Learn</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{story.moralLesson}</p>
            </div>
          </div>

          {/* Characters & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Characters</h3>
              </div>
              <div className="space-y-2">
                {story.characters.map((character, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{character}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Settings</h3>
              </div>
              <div className="space-y-2">
                {story.settings.map((setting, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{setting}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Suggestions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Visual Ideas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {story.visualSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-600 font-bold text-lg">{index + 1}</span>
                    <p className="text-purple-800 text-sm">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
