import { WeatherData, WeatherRecommendations } from '../types';

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

export async function generateWeatherSuggestions(weatherData: WeatherData): Promise<WeatherRecommendations> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback weather suggestions');
    return getFallbackWeatherSuggestions(weatherData);
  }

  try {
    const prompt = buildWeatherSuggestionsPrompt(weatherData);
    
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
    const contentText = data.candidates[0]?.content?.parts[0]?.text;

    if (!contentText) {
      throw new Error('No content returned from Gemini');
    }

    return parseWeatherSuggestionsResponse(contentText, weatherData);

  } catch (error) {
    console.error('Error calling Gemini API for weather suggestions:', error);
    return getFallbackWeatherSuggestions(weatherData);
  }
}

function buildWeatherSuggestionsPrompt(weatherData: WeatherData): string {
  const current = weatherData.current;
  const today = weatherData.daily[0];
  
  return `You are a helpful weather assistant providing positive, practical recommendations for daily activities based on current weather conditions in Australia.

CURRENT WEATHER DATA:
- Current Temperature: ${current.temperature}°C
- Feels Like: ${current.apparent_temperature}°C
- Humidity: ${current.relative_humidity}%
- Wind Speed: ${current.windspeed} km/h
- Wind Direction: ${current.winddirection}°
- Weather Code: ${current.weathercode}
- Precipitation Probability: ${current.precipitation_probability}%
- UV Index: ${current.uv_index}
- Visibility: ${current.visibility} km

DAILY FORECAST:
- Max Temperature: ${today.temperature_2m_max}°C
- Min Temperature: ${today.temperature_2m_min}°C
- Precipitation Probability: ${today.precipitation_probability_max}%
- Weather Code: ${today.weathercode}

Generate a JSON response with practical, positive recommendations:

{
  "summary": "Brief, encouraging summary of the day's weather and what it means for activities",
  "umbrellaNeeded": true/false,
  "clothingAdvice": "Specific clothing recommendations for comfort and safety",
  "activitySuggestions": [
    {
      "id": "activity_1",
      "type": "activity",
      "priority": "high|medium|low",
      "title": "Activity suggestion title",
      "description": "Why this activity is perfect for today's weather",
      "icon": "activity_icon_name",
      "emoji": "🏃",
      "actionable": true,
      "category": "outdoor|indoor|exercise|leisure"
    }
  ],
  "precautions": [
    {
      "id": "precaution_1",
      "type": "precaution",
      "priority": "high|medium|low",
      "title": "Important safety precaution",
      "description": "Why this precaution is important today",
      "icon": "precaution_icon_name",
      "emoji": "⚠️",
      "actionable": true,
      "category": "safety|health|comfort"
    }
  ],
  "opportunities": [
    {
      "id": "opportunity_1",
      "type": "opportunity",
      "priority": "medium|low",
      "title": "Weather opportunity",
      "description": "Something positive about today's weather conditions",
      "icon": "opportunity_icon_name",
      "emoji": "✨",
      "actionable": false,
      "category": "photography|gardening|outdoor|relaxation"
    }
  ],
  "overallMood": "excellent|good|fair|challenging",
  "confidence": 0.85,
  "generatedAt": "ISO timestamp"
}

GUIDELINES:
1. Be POSITIVE and ENCOURAGING - focus on opportunities, not limitations
2. Provide PRACTICAL advice - what people can actually do
3. Consider AUSTRALIAN context - activities suitable for Australian lifestyle
4. Be SPECIFIC about clothing and preparations needed
5. Include SAFETY considerations for extreme weather
6. Suggest ACTIVITIES that make the most of current conditions
7. Use APPROPRIATE emojis and icons for visual appeal
8. Make recommendations ACTIONABLE and HELPFUL

UMBRELLA GUIDANCE:
- True if precipitation probability > 30% OR weather code indicates rain
- False if clear skies and low precipitation chance

CLOTHING ADVICE:
- Consider temperature, wind, UV index, and precipitation
- Be specific about layers, materials, and accessories
- Include sun protection for high UV days

ACTIVITY SUGGESTIONS:
- Outdoor activities for good weather
- Indoor alternatives for poor weather
- Seasonal activities appropriate for Australia
- Consider temperature, wind, and precipitation

PRECAUTIONS:
- Sun protection for high UV days
- Wind safety for high wind speeds
- Temperature extremes (heat/cold)
- Visibility issues for fog or heavy rain

OPPORTUNITIES:
- Photography during dramatic weather
- Gardening after rain
- Outdoor dining in pleasant weather
- Stargazing on clear nights

Respond with ONLY the JSON, no additional text.`;
}

function parseWeatherSuggestionsResponse(responseText: string, weatherData: WeatherData): WeatherRecommendations {
  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const recommendations: WeatherRecommendations = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    recommendations.generatedAt = recommendations.generatedAt || new Date().toISOString();
    recommendations.confidence = recommendations.confidence || 0.8;

    console.log('🌤️ Weather suggestions generated:', {
      summary: recommendations.summary,
      umbrellaNeeded: recommendations.umbrellaNeeded,
      mood: recommendations.overallMood
    });

    return recommendations;

  } catch (error) {
    console.error('Error parsing weather suggestions response:', error);
    return getFallbackWeatherSuggestions(weatherData);
  }
}

function getFallbackWeatherSuggestions(weatherData: WeatherData): WeatherRecommendations {
  const current = weatherData.current;
  const temperature = current.temperature;
  const precipitation = current.precipitation_probability;
  const windSpeed = current.windspeed;
  const uvIndex = current.uv_index;

  // Determine umbrella need
  const umbrellaNeeded = precipitation > 30 || [51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(current.weathercode);

  // Determine overall mood
  let overallMood: 'excellent' | 'good' | 'fair' | 'challenging' = 'good';
  if (temperature > 35 || temperature < 5 || windSpeed > 50 || precipitation > 70) {
    overallMood = 'challenging';
  } else if (temperature > 30 || windSpeed > 30 || precipitation > 50) {
    overallMood = 'fair';
  } else if (temperature >= 18 && temperature <= 28 && windSpeed < 20 && precipitation < 20) {
    overallMood = 'excellent';
  }

  // Generate clothing advice
  let clothingAdvice = '';
  if (temperature > 30) {
    clothingAdvice = 'Light, breathable clothing. Cotton or linen materials. Don\'t forget sunscreen and a hat for UV protection.';
  } else if (temperature > 20) {
    clothingAdvice = 'Comfortable summer clothing. Light layers work well. Consider sun protection if spending time outdoors.';
  } else if (temperature > 10) {
    clothingAdvice = 'Light layers recommended. A light jacket or cardigan will be perfect for temperature changes.';
  } else {
    clothingAdvice = 'Warm clothing essential. Layer up with a coat, scarf, and gloves. Stay cozy!';
  }

  if (windSpeed > 25) {
    clothingAdvice += ' Wind-resistant outer layer recommended.';
  }

  // Generate activity suggestions
  const activitySuggestions = [];
  if (temperature >= 18 && precipitation < 30 && windSpeed < 25) {
    activitySuggestions.push({
      id: 'outdoor_walk',
      type: 'activity' as const,
      priority: 'high' as const,
      title: 'Perfect Day for Outdoor Activities',
      description: 'Ideal conditions for walking, cycling, or outdoor sports. The weather is just right!',
      icon: 'sun',
      emoji: '🚶‍♂️',
      actionable: true,
      category: 'outdoor'
    });
  }

  if (precipitation > 50) {
    activitySuggestions.push({
      id: 'indoor_activities',
      type: 'activity' as const,
      priority: 'high' as const,
      title: 'Great Indoor Day',
      description: 'Perfect weather for indoor activities like visiting museums, reading, or cooking.',
      icon: 'home',
      emoji: '🏠',
      actionable: true,
      category: 'indoor'
    });
  }

  if (temperature > 25 && precipitation < 20) {
    activitySuggestions.push({
      id: 'beach_weather',
      type: 'activity' as const,
      priority: 'medium' as const,
      title: 'Beach Weather',
      description: 'Excellent conditions for beach activities or water sports. Don\'t forget sun protection!',
      icon: 'waves',
      emoji: '🏖️',
      actionable: true,
      category: 'outdoor'
    });
  }

  // Generate precautions
  const precautions = [];
  if (uvIndex > 6) {
    precautions.push({
      id: 'sun_protection',
      type: 'precaution' as const,
      priority: 'high' as const,
      title: 'High UV Protection Needed',
      description: 'UV index is high. Wear sunscreen, hat, and sunglasses. Seek shade during peak hours.',
      icon: 'sun',
      emoji: '☀️',
      actionable: true,
      category: 'health'
    });
  }

  if (windSpeed > 40) {
    precautions.push({
      id: 'wind_safety',
      type: 'precaution' as const,
      priority: 'high' as const,
      title: 'Strong Wind Alert',
      description: 'High wind speeds detected. Secure loose items and be cautious outdoors.',
      icon: 'wind',
      emoji: '💨',
      actionable: true,
      category: 'safety'
    });
  }

  if (temperature > 35) {
    precautions.push({
      id: 'heat_safety',
      type: 'precaution' as const,
      priority: 'high' as const,
      title: 'Extreme Heat Warning',
      description: 'Very hot conditions. Stay hydrated, avoid outdoor activities during peak heat, and seek air conditioning.',
      icon: 'thermometer',
      emoji: '🌡️',
      actionable: true,
      category: 'health'
    });
  }

  // Generate opportunities
  const opportunities = [];
  if (precipitation > 30 && precipitation < 70) {
    opportunities.push({
      id: 'photography',
      type: 'opportunity' as const,
      priority: 'medium' as const,
      title: 'Photography Opportunity',
      description: 'Dramatic weather conditions can create beautiful photo opportunities.',
      icon: 'camera',
      emoji: '📸',
      actionable: false,
      category: 'photography'
    });
  }

  if (temperature >= 20 && temperature <= 28 && windSpeed < 15) {
    opportunities.push({
      id: 'outdoor_dining',
      type: 'opportunity' as const,
      priority: 'low' as const,
      title: 'Perfect for Outdoor Dining',
      description: 'Ideal weather for enjoying a meal outdoors or having a picnic.',
      icon: 'utensils',
      emoji: '🍽️',
      actionable: false,
      category: 'leisure'
    });
  }

  // Generate summary
  let summary = '';
  if (overallMood === 'excellent') {
    summary = 'What a beautiful day! Perfect weather for outdoor activities and enjoying the great outdoors.';
  } else if (overallMood === 'good') {
    summary = 'Nice weather today! Good conditions for most activities with some minor considerations.';
  } else if (overallMood === 'fair') {
    summary = 'Decent weather with some conditions to be mindful of. Plan accordingly and you\'ll have a great day!';
  } else {
    summary = 'Challenging weather conditions today. Take necessary precautions and consider indoor alternatives.';
  }

  return {
    summary,
    umbrellaNeeded,
    clothingAdvice,
    activitySuggestions,
    precautions,
    opportunities,
    overallMood,
    confidence: 0.7,
    generatedAt: new Date().toISOString()
  };
}
