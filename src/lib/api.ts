import { WeatherData, NewsArticle, HealthFacility } from '../types';

// We use Open-Meteo for weather data - it's free and reliable
// For news, we try NewsAPI first, then fall back to mock data

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'Australia/Sydney',
    forecast_days: '7'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();
  
  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      windspeed: Math.round(data.current.wind_speed_10m),
      winddirection: data.current.wind_direction_10m,
      weathercode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      visibility: Math.round(data.current.visibility / 1000)
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weather_code,
      temperature_2m_max: data.daily.temperature_2m_max.map((temp: number) => Math.round(temp)),
      temperature_2m_min: data.daily.temperature_2m_min.map((temp: number) => Math.round(temp)),
      precipitation_probability_max: data.daily.precipitation_probability_max,
      windspeed_10m_max: data.daily.wind_speed_10m_max.map((speed: number) => Math.round(speed))
    }
  };
}

export async function fetchAustralianNews(userState?: string): Promise<NewsArticle[]> {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  
  // If no API key is provided, we'll use mock data so the app still works
  if (!apiKey) {
    console.warn('NewsAPI key not configured, using mock data');
    return getMockNews();
  }

  try {
    // Build search query for Australian news
    let query = 'Australia';
    let country = 'au';
    
    // If user has a specific state, add it to the query for more relevant news
    if (userState && userState !== 'NSW') {
      const stateQueries: Record<string, string> = {
        'VIC': 'Victoria Melbourne',
        'QLD': 'Queensland Brisbane',
        'WA': 'Western Australia Perth',
        'SA': 'South Australia Adelaide',
        'TAS': 'Tasmania Hobart',
        'ACT': 'Canberra ACT',
        'NT': 'Northern Territory Darwin'
      };
      
      if (stateQueries[userState]) {
        query += ` OR ${stateQueries[userState]}`;
      }
    }

    // Fetch top headlines from Australian sources
    const headlinesUrl = `https://newsapi.org/v2/top-headlines?country=au&pageSize=10&apiKey=${apiKey}`;
    
    // Fetch general Australian news with Australian domains for better relevance
    const australianDomains = 'abc.net.au,theaustralian.com.au,news.com.au,smh.com.au,theage.com.au,perthnow.com.au,couriermail.com.au,adelaidenow.com.au,heraldsun.com.au,dailytelegraph.com.au,canberratimes.com.au,watoday.com.au';
    const everythingUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${australianDomains}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

    const [headlinesResponse, everythingResponse] = await Promise.all([
      fetch(headlinesUrl),
      fetch(everythingUrl)
    ]);

    // Handle API errors gracefully
    if (headlinesResponse.status === 401) {
      throw new Error('Invalid NewsAPI key. Please check your API key configuration.');
    }
    
    if (headlinesResponse.status === 429) {
      throw new Error('NewsAPI rate limit exceeded. Please try again later.');
    }

    const [headlinesData, everythingData] = await Promise.all([
      headlinesResponse.ok ? headlinesResponse.json() : { articles: [] },
      everythingResponse.ok ? everythingResponse.json() : { articles: [] }
    ]);

    // Check for API-specific error messages
    if (headlinesData.status === 'error') {
      throw new Error(headlinesData.message || 'NewsAPI returned an error');
    }
    
    if (everythingData.status === 'error') {
      throw new Error(everythingData.message || 'NewsAPI returned an error');
    }

    // Combine and deduplicate articles
    const allArticles = [...headlinesData.articles, ...everythingData.articles];
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );

    // Transform to our NewsArticle format
    const transformedArticles = uniqueArticles.slice(0, 12).map(article => ({
      title: article.title || 'No title available',
      description: article.description || '',
      url: article.url || '#',
      urlToImage: article.urlToImage || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown source'
      },
      category: categorizeArticle(article.title, article.description, article.source?.name)
    }));

    console.log(`📰 Loaded ${transformedArticles.length} news articles from NewsAPI for ${userState || 'Australia'}`);
    return transformedArticles;

  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error);
    console.log('Falling back to mock data');
    return getMockNews();
  }
}

function categorizeArticle(title: string, description: string, sourceName?: string): 'emergency' | 'weather' | 'health' | 'general' {
  const text = `${title} ${description} ${sourceName || ''}`.toLowerCase();
  
  // Emergency keywords
  const emergencyKeywords = ['emergency', 'fire', 'flood', 'bushfire', 'evacuation', 'warning', 'alert', 'disaster', 'crisis', 'accident', 'crash'];
  if (emergencyKeywords.some(keyword => text.includes(keyword))) {
    return 'emergency';
  }
  
  // Weather keywords
  const weatherKeywords = ['weather', 'storm', 'rain', 'sunny', 'temperature', 'bureau of meteorology', 'bom', 'cyclone', 'drought', 'heatwave'];
  if (weatherKeywords.some(keyword => text.includes(keyword))) {
    return 'weather';
  }
  
  // Health keywords
  const healthKeywords = ['health', 'hospital', 'medical', 'covid', 'vaccine', 'doctor', 'healthcare', 'mental health', 'pharmacy', 'clinic'];
  if (healthKeywords.some(keyword => text.includes(keyword))) {
    return 'health';
  }
  
  return 'general';
}

function getMockNews(): NewsArticle[] {
  return [
    {
      title: "Severe Weather Warning Issued for Sydney and Surrounds",
      description: "Bureau of Meteorology issues severe thunderstorm warning with potential for damaging winds and large hail.",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: "Bureau of Meteorology" },
      category: "weather"
    },
    {
      title: "Emergency Services Respond to Bushfire Alert in Blue Mountains",
      description: "Rural Fire Service crews working to contain grass fire near Katoomba as emergency warning issued for residents.",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/266487/pexels-photo-266487.jpeg",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: "NSW RFS" },
      category: "emergency"
    },
    {
      title: "New Health Initiative Launched Across Regional Australia",
      description: "Federal government announces $200M investment in rural healthcare infrastructure and mobile health services.",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: { name: "Department of Health" },
      category: "health"
    },
    {
      title: "Australia Day Celebrations Begin Across the Nation",
      description: "Communities nationwide prepare for Australia Day festivities with events planned in major cities and towns.",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: { name: "ABC News" },
      category: "general"
    }
  ];
}

export async function fetchHealthFacilities(latitude: number, longitude: number): Promise<HealthFacility[]> {
  // Mock data for demo - in production, integrate with Australian Health Facilities API
  return getMockHealthFacilities(latitude, longitude);
}

function getMockHealthFacilities(lat: number, lng: number): HealthFacility[] {
  const facilities = [
    {
      id: '1',
      name: 'Royal Prince Alfred Hospital',
      type: 'hospital' as const,
      address: 'Missenden Road, Camperdown NSW 2050',
      phone: '(02) 9515 6111',
      latitude: -33.8884,
      longitude: 151.1886,
      services: ['Emergency', 'Surgery', 'Cardiology', 'Oncology'],
      emergencyServices: true
    },
    {
      id: '2',
      name: 'Sydney Medical Centre',
      type: 'gp' as const,
      address: '123 George Street, Sydney NSW 2000',
      phone: '(02) 9234 5678',
      latitude: -33.8688,
      longitude: 151.2093,
      services: ['General Practice', 'Vaccinations', 'Health Checks'],
      emergencyServices: false
    },
    {
      id: '3',
      name: 'Priceline Pharmacy World Square',
      type: 'pharmacy' as const,
      address: '644 George Street, Sydney NSW 2000',
      phone: '(02) 9264 6565',
      latitude: -33.8765,
      longitude: 151.2062,
      services: ['Prescription', 'Over-the-counter', 'Health Advice'],
      emergencyServices: false
    }
  ];

  // Calculate distances and sort by proximity
  return facilities.map(facility => ({
    ...facility,
    distance: calculateDistance(lat, lng, facility.latitude, facility.longitude)
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
}

export function getWeatherIcon(code: number): string {
  const iconMap: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️',
    61: '🌧️', 63: '🌧️', 65: '⛈️',
    71: '🌨️', 73: '🌨️', 75: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  
  return iconMap[code] || '🌤️';
}