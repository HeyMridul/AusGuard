import { WeatherData, NewsArticle, Alert, GeminiAnalysis } from '../types';

// This is where the magic happens - Gemini AI analyzes weather and news data
// to provide smart safety recommendations
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function analyzeWeatherAndNews(
  weatherData: WeatherData | null,
  newsArticles: NewsArticle[],
  userLocation: { state?: string; suburb?: string }
): Promise<GeminiAnalysis> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback analysis');
    return getFallbackAnalysis(weatherData, newsArticles);
  }

  try {
    const prompt = buildAnalysisPrompt(weatherData, newsArticles, userLocation);
    
    const requestBody: GeminiRequest = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const analysisText = data.candidates[0]?.content?.parts[0]?.text;

    if (!analysisText) {
      throw new Error('No analysis returned from Gemini');
    }

    return parseGeminiResponse(analysisText, weatherData, newsArticles);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getFallbackAnalysis(weatherData, newsArticles);
  }
}

function buildAnalysisPrompt(
  weatherData: WeatherData | null,
  newsArticles: NewsArticle[],
  userLocation: { state?: string; suburb?: string }
): string {
  const location = userLocation.suburb && userLocation.state 
    ? `${userLocation.suburb}, ${userLocation.state}` 
    : userLocation.state || 'Australia';

  let prompt = `You are an AI safety analyst for AUSGuard, an Australian safety and health monitoring app. 

Analyze the following weather and news data for the location: ${location}

WEATHER DATA:
${weatherData ? JSON.stringify({
  current: weatherData.current,
  daily_forecast: weatherData.daily.time.map((date, i) => ({
    date,
    max_temp: weatherData.daily.temperature_2m_max[i],
    min_temp: weatherData.daily.temperature_2m_min[i],
    weather_code: weatherData.daily.weathercode[i],
    precipitation_probability: weatherData.daily.precipitation_probability_max[i]
  }))
}, null, 2) : 'No weather data available'}

NEWS ARTICLES:
${newsArticles.map(article => ({
  title: article.title,
  description: article.description,
  category: article.category,
  source: article.source.name,
  publishedAt: article.publishedAt
})).slice(0, 8).map(JSON.stringify).join('\n')}

TASK: Analyze this data and provide a JSON response with the following structure:
{
  "alerts": [
    {
      "id": "unique_id",
      "type": "weather|emergency|health",
      "severity": "low|medium|high|critical",
      "title": "Brief alert title",
      "description": "Detailed description of the threat or situation",
      "source": "gemini_analysis",
      "location": "${location}",
      "timestamp": "ISO timestamp",
      "expiresAt": "ISO timestamp if applicable",
      "recommendations": ["actionable recommendation 1", "recommendation 2"],
      "preparationSteps": ["specific preparation step 1", "step 2"],
      "emergencyContacts": ["relevant emergency contact if needed"]
    }
  ],
  "summary": "Brief overall assessment",
  "riskLevel": "low|medium|high|critical",
  "confidence": 0.85,
  "analysisTimestamp": "ISO timestamp"
}

CRITICAL REQUIREMENTS - ONLY GENERATE ALERTS FOR:
1. **WEATHER THREATS** (from weather data):
   - Extreme temperatures (heatwave >35°C, cold snap <5°C)
   - Severe weather (thunderstorms, heavy rain, strong winds >60km/h)
   - Storm conditions (weather codes 95, 96, 99)
   - High precipitation probability (>70%)
   - Low visibility (<5km) or fog conditions

2. **EMERGENCY SITUATIONS** (from news - ONLY these keywords):
   - Bushfire, wildfire, fire, evacuation
   - Flood, flooding, flash flood, river flood
   - Cyclone, hurricane, severe storm
   - Emergency, disaster, crisis, evacuation order
   - Road closure due to weather, power outage due to weather

3. **HEALTH THREATS** (from news - ONLY these keywords):
   - COVID, pandemic, disease outbreak
   - Air quality warning, smoke warning
   - Heat-related illness, cold-related illness
   - Public health emergency

**DO NOT CREATE ALERTS FOR:**
- General news articles (construction, technology, entertainment, sports)
- Political news, business news, celebrity news
- Non-weather related accidents or incidents
- General health advice or medical studies
- Housing, economy, or social issues

Be extremely selective. Only create alerts for immediate safety threats that require user action.
If no genuine safety threats are identified, return an empty alerts array with low risk level.

Respond with ONLY the JSON, no additional text.`;

  return prompt;
}

function parseGeminiResponse(
  responseText: string,
  weatherData: WeatherData | null,
  newsArticles: NewsArticle[]
): GeminiAnalysis {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const analysis: GeminiAnalysis = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    analysis.alerts = analysis.alerts.map(alert => ({
      ...alert,
      id: alert.id || generateAlertId(),
      timestamp: alert.timestamp || new Date().toISOString(),
      analysisTimestamp: analysis.analysisTimestamp || new Date().toISOString()
    }));

    console.log('🤖 Gemini analysis completed:', {
      alertsCount: analysis.alerts.length,
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence
    });

    return analysis;

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return getFallbackAnalysis(weatherData, newsArticles);
  }
}

function getFallbackAnalysis(
  weatherData: WeatherData | null,
  newsArticles: NewsArticle[]
): GeminiAnalysis {
  const alerts: Alert[] = [];

  // Basic weather-based alerts
  if (weatherData) {
    const currentTemp = weatherData.current.temperature;
    const weatherCode = weatherData.current.weathercode;

    // Extreme temperature alerts - more realistic thresholds
    if (currentTemp > 38) {
      alerts.push({
        id: generateAlertId(),
        type: 'weather',
        severity: currentTemp > 42 ? 'critical' : 'high',
        title: 'Heatwave Warning',
        description: `Extreme heat conditions with temperature reaching ${currentTemp}°C. Heat-related illnesses are a serious risk.`,
        source: 'weather_api',
        timestamp: new Date().toISOString(),
        recommendations: [
          'Stay indoors during the hottest part of the day (10am-4pm)',
          'Drink plenty of water and avoid alcohol',
          'Check on elderly neighbors and family members'
        ],
        preparationSteps: [
          'Ensure air conditioning is working',
          'Stock up on water and electrolytes',
          'Prepare cool areas in your home'
        ]
      });
    }

    // Cold snap alerts
    if (currentTemp < 2) {
      alerts.push({
        id: generateAlertId(),
        type: 'weather',
        severity: currentTemp < 0 ? 'high' : 'medium',
        title: 'Cold Snap Warning',
        description: `Extremely cold conditions with temperature dropping to ${currentTemp}°C. Risk of hypothermia and frostbite.`,
        source: 'weather_api',
        timestamp: new Date().toISOString(),
        recommendations: [
          'Stay indoors and keep warm',
          'Layer clothing if going outside',
          'Check heating systems and pipes'
        ],
        preparationSteps: [
          'Ensure heating is working properly',
          'Insulate pipes to prevent freezing',
          'Keep emergency blankets and warm clothing ready'
        ]
      });
    }

    // Severe weather alerts
    if ([95, 96, 99].includes(weatherCode)) {
      alerts.push({
        id: generateAlertId(),
        type: 'weather',
        severity: 'high',
        title: 'Severe Thunderstorm Alert',
        description: 'Severe thunderstorms with potential for damaging winds, large hail, and heavy rainfall.',
        source: 'weather_api',
        timestamp: new Date().toISOString(),
        recommendations: [
          'Avoid outdoor activities',
          'Secure loose objects around your property',
          'Stay away from windows during the storm'
        ],
        preparationSteps: [
          'Move vehicles under cover',
          'Prepare emergency kit with torch and batteries',
          'Monitor weather updates regularly'
        ]
      });
    }

    // High wind alerts
    const windSpeed = weatherData.current.windspeed;
    if (windSpeed > 60) {
      alerts.push({
        id: generateAlertId(),
        type: 'weather',
        severity: windSpeed > 80 ? 'high' : 'medium',
        title: 'High Wind Warning',
        description: `Strong winds of ${Math.round(windSpeed)} km/h. Potential for falling branches and dangerous driving conditions.`,
        source: 'weather_api',
        timestamp: new Date().toISOString(),
        recommendations: [
          'Avoid driving if possible',
          'Stay away from trees and power lines',
          'Secure outdoor furniture and loose objects'
        ],
        preparationSteps: [
          'Check for loose roof tiles or gutters',
          'Trim overhanging branches if safe to do so',
          'Prepare emergency kit'
        ]
      });
    }

    // Low visibility alerts
    const visibility = weatherData.current.visibility;
    if (visibility < 5) {
      alerts.push({
        id: generateAlertId(),
        type: 'weather',
        severity: visibility < 2 ? 'high' : 'medium',
        title: 'Low Visibility Warning',
        description: `Poor visibility conditions with only ${Math.round(visibility)} km visibility. Dangerous for driving.`,
        source: 'weather_api',
        timestamp: new Date().toISOString(),
        recommendations: [
          'Avoid driving unless absolutely necessary',
          'Use low beam headlights if driving',
          'Drive slowly and increase following distance'
        ],
        preparationSteps: [
          'Check vehicle lights and windshield wipers',
          'Allow extra travel time if driving is necessary',
          'Consider delaying non-essential travel'
        ]
      });
    }
  }

  // News-based emergency alerts - only for genuine emergencies
  const emergencyNews = newsArticles.filter(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const emergencyKeywords = [
      'bushfire', 'wildfire', 'fire', 'evacuation',
      'flood', 'flooding', 'flash flood', 'river flood',
      'cyclone', 'hurricane', 'severe storm',
      'emergency', 'disaster', 'crisis', 'evacuation order'
    ];
    return emergencyKeywords.some(keyword => text.includes(keyword));
  });

  emergencyNews.slice(0, 2).forEach(article => {
    alerts.push({
      id: generateAlertId(),
      type: 'emergency',
      severity: 'high',
      title: article.title,
      description: article.description,
      source: 'news_api',
      timestamp: new Date().toISOString(),
      recommendations: [
        'Follow official emergency service instructions',
        'Stay informed through official channels',
        'Prepare evacuation plan if recommended'
      ],
      preparationSteps: [
        'Ensure emergency kit is ready',
        'Keep mobile phone charged',
        'Know your local evacuation routes'
      ],
      emergencyContacts: ['000 (Emergency Services)', '131 444 (Police Assistance)']
    });
  });

  const riskLevel = alerts.length === 0 ? 'low' : 
                   alerts.some(a => a.severity === 'critical') ? 'critical' :
                   alerts.some(a => a.severity === 'high') ? 'high' : 'medium';

  return {
    alerts,
    summary: alerts.length === 0 
      ? 'No immediate threats detected. Conditions appear normal for the area.'
      : `${alerts.length} alert(s) identified requiring attention.`,
    riskLevel,
    confidence: 0.7,
    analysisTimestamp: new Date().toISOString()
  };
}

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
