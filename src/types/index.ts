export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  suburb?: string;
  state?: string;
  postcode?: string;
  notification_preferences: {
    severe_weather: boolean;
    emergency_alerts: boolean;
    health_reminders: boolean;
    news_updates: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    humidity: number;
    visibility: number;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
  };
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  headline: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  certainty: 'possible' | 'likely' | 'observed';
  urgency: 'immediate' | 'expected' | 'future';
  effective: string;
  expires: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: 'emergency' | 'weather' | 'health' | 'general';
}

export interface HealthFacility {
  id: string;
  name: string;
  type: 'hospital' | 'gp' | 'pharmacy';
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  services?: string[];
  emergencyServices: boolean;
}

export interface Alert {
  id: string;
  type: 'weather' | 'emergency' | 'health' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: 'weather_api' | 'news_api' | 'gemini_analysis';
  location?: string;
  timestamp: string;
  expiresAt?: string;
  recommendations: string[];
  preparationSteps: string[];
  emergencyContacts?: string[];
}

export interface GeminiAnalysis {
  alerts: Alert[];
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  analysisTimestamp: string;
}

export interface FoodItem {
  name: string;
  category: 'vegetable' | 'fruit' | 'meat' | 'seafood' | 'dairy' | 'grain' | 'herb' | 'spice' | 'other';
  quantity?: string;
  condition?: 'fresh' | 'frozen' | 'canned' | 'dried';
}

export interface AustralianDish {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: string;
  cookTime: string;
  serves: number;
  ingredients: string[];
  instructions: string[];
  tips?: string[];
  traditionalOrigin?: string;
}

export interface FoodAnalysis {
  detectedItems: FoodItem[];
  suggestedDishes: AustralianDish[];
  confidence: number;
  analysisTimestamp: string;
}

export interface AustralianFact {
  id: string;
  category: 'history' | 'geography' | 'culture' | 'wildlife' | 'sports' | 'food' | 'language' | 'innovation' | 'nature' | 'people';
  title: string;
  content: string;
  interestingFact: string;
  didYouKnow: string;
  culturalSignificance?: string;
  relatedLocation?: string;
  state?: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  tags: string[];
}

export interface AusBoardContent {
  dailyFact: AustralianFact;
  weeklySpotlight: AustralianFact;
  culturalMoment: {
    title: string;
    description: string;
    significance: string;
    relatedFacts: string[];
  };
  funTrivia: {
    question: string;
    answer: string;
    explanation: string;
    category: string;
  };
  australianism: {
    word: string;
    meaning: string;
    example: string;
    origin: string;
  };
  lastUpdated: string;
}

export interface WeatherSuggestion {
  id: string;
  type: 'clothing' | 'activity' | 'precaution' | 'opportunity' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
  emoji: string;
  actionable: boolean;
  category: string;
}

export interface WeatherRecommendations {
  summary: string;
  umbrellaNeeded: boolean;
  clothingAdvice: string;
  activitySuggestions: WeatherSuggestion[];
  precautions: WeatherSuggestion[];
  opportunities: WeatherSuggestion[];
  overallMood: 'excellent' | 'good' | 'fair' | 'challenging';
  confidence: number;
  generatedAt: string;
}

export interface AusKidsTheme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  ageGroup: '3-5' | '6-8' | '9-12' | 'all';
  culturalFocus: string;
  exampleTopics: string[];
}

export interface AusKidsStory {
  id: string;
  title: string;
  theme: string;
  content: string;
  characters: string[];
  settings: string[];
  culturalFacts: string[];
  moralLesson: string;
  ageAppropriate: boolean;
  visualSuggestions: string[];
  readingTime: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  generatedAt: string;
}

export interface AusKidsStoryRequest {
  theme: string;
  userTitle: string;
  ageGroup: string;
}