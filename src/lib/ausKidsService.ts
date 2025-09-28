import { AusKidsTheme, AusKidsStory, AusKidsStoryRequest } from '../types';

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

export const AUSKIDS_THEMES: AusKidsTheme[] = [
  {
    id: 'wildlife_adventure',
    name: 'Wildlife Adventure',
    description: 'Stories about Australian animals and nature',
    emoji: '🐨',
    color: 'bg-green-100 text-green-700 border-green-200',
    ageGroup: 'all',
    culturalFocus: 'Australian wildlife and conservation',
    exampleTopics: ['Koala rescue mission', 'Kangaroo family', 'Great Barrier Reef adventure']
  },
  {
    id: 'indigenous_culture',
    name: 'Indigenous Culture',
    description: 'Stories celebrating Aboriginal and Torres Strait Islander culture',
    emoji: '🎨',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    ageGroup: '6-8',
    culturalFocus: 'Indigenous traditions and Dreamtime stories',
    exampleTopics: ['Dreamtime adventure', 'Traditional art', 'Bush tucker gathering']
  },
  {
    id: 'aussie_traditions',
    name: 'Aussie Traditions',
    description: 'Stories about Australian customs and celebrations',
    emoji: '🇦🇺',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    ageGroup: 'all',
    culturalFocus: 'Australian traditions and community spirit',
    exampleTopics: ['ANZAC Day parade', 'Christmas in summer', 'School sports day']
  },
  {
    id: 'outback_exploration',
    name: 'Outback Exploration',
    description: 'Adventures in the Australian outback',
    emoji: '🏜️',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    ageGroup: '9-12',
    culturalFocus: 'Outback life and Australian geography',
    exampleTopics: ['Cattle station adventure', 'Desert survival', 'Mining town discovery']
  },
  {
    id: 'coastal_life',
    name: 'Coastal Life',
    description: 'Stories about life by the Australian coast',
    emoji: '🏖️',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    ageGroup: 'all',
    culturalFocus: 'Beach culture and marine life',
    exampleTopics: ['Surfing lesson', 'Beach cleanup', 'Lighthouse mystery']
  },
  {
    id: 'multicultural_australia',
    name: 'Multicultural Australia',
    description: 'Stories celebrating Australia\'s diversity',
    emoji: '🌏',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    ageGroup: 'all',
    culturalFocus: 'Cultural diversity and inclusion',
    exampleTopics: ['Food festival', 'Language exchange', 'Community garden']
  },
  {
    id: 'aussie_inventions',
    name: 'Aussie Inventions',
    description: 'Stories about Australian innovations and achievements',
    emoji: '🔬',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    ageGroup: '9-12',
    culturalFocus: 'Australian innovation and science',
    exampleTopics: ['WiFi discovery', 'Refrigerator invention', 'Space exploration']
  },
  {
    id: 'sports_spirit',
    name: 'Sports Spirit',
    description: 'Stories about Australian sports and teamwork',
    emoji: '🏏',
    color: 'bg-red-100 text-red-700 border-red-200',
    ageGroup: 'all',
    culturalFocus: 'Australian sports culture and mateship',
    exampleTopics: ['Cricket match', 'AFL training', 'Olympic dreams']
  }
];

export async function generateAusKidsStory(request: AusKidsStoryRequest): Promise<AusKidsStory> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback AusKids story');
    return getFallbackAusKidsStory(request);
  }

  try {
    const prompt = buildAusKidsStoryPrompt(request);
    
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

    return parseAusKidsStoryResponse(contentText, request);

  } catch (error) {
    console.error('Error calling Gemini API for AusKids story:', error);
    return getFallbackAusKidsStory(request);
  }
}

function buildAusKidsStoryPrompt(request: AusKidsStoryRequest): string {
  const theme = AUSKIDS_THEMES.find(t => t.id === request.theme);
  
  return `You are a children's story author specializing in educational Australian stories. Create an engaging, age-appropriate story that teaches meaningful facts about Australia and Australian culture.

STORY REQUEST:
- Theme: ${theme?.name || request.theme}
- User's Title: "${request.userTitle}"
- Age Group: ${request.ageGroup}
- Cultural Focus: ${theme?.culturalFocus || 'Australian culture and values'}

Create a JSON response with this structure:

{
  "id": "story_unique_id",
  "title": "Engaging story title based on user input",
  "theme": "${request.theme}",
  "content": "Complete story content (500-800 words for ages 6+, 200-400 words for ages 3-5). Use simple, engaging language appropriate for the age group. Include dialogue, descriptive scenes, and a clear narrative arc.",
  "characters": ["Character 1", "Character 2", "Character 3"],
  "settings": ["Setting 1", "Setting 2", "Setting 3"],
  "culturalFacts": [
    "Interesting fact about Australia from the story",
    "Another cultural fact or tradition mentioned",
    "Educational element about Australian life"
  ],
  "moralLesson": "Positive lesson or value taught through the story",
  "ageAppropriate": true,
  "visualSuggestions": [
    "Visual description for illustration 1",
    "Visual description for illustration 2",
    "Visual description for illustration 3",
    "Visual description for illustration 4"
  ],
  "readingTime": "X minutes",
  "difficulty": "easy|medium|advanced",
  "generatedAt": "ISO timestamp"
}

STORY GUIDELINES:
1. **Age-Appropriate Content**: Use language and concepts suitable for the specified age group
2. **Australian Focus**: Include authentic Australian elements, locations, traditions, or wildlife
3. **Educational Value**: Weave in meaningful facts about Australian culture, geography, or history
4. **Positive Values**: Teach positive lessons like friendship, respect, courage, or environmental care
5. **Engaging Narrative**: Create an interesting plot with relatable characters and clear conflict/resolution
6. **Cultural Respect**: Handle Indigenous culture and multicultural elements with respect and accuracy
7. **Visual Appeal**: Include vivid descriptions that would make great illustrations

CONTENT REQUIREMENTS:
- **Length**: Appropriate for age group (shorter for younger children)
- **Language**: Simple, clear, and engaging vocabulary
- **Structure**: Clear beginning, middle, and end with a satisfying resolution
- **Dialogue**: Include character conversations to make the story interactive
- **Australian Elements**: Authentic Australian settings, characters, or cultural references
- **Learning**: At least 2-3 educational facts naturally woven into the story

VISUAL SUGGESTIONS:
- Provide 4 detailed visual descriptions that would make excellent illustrations
- Include diverse characters and Australian settings
- Consider the age group when describing visual complexity
- Make suggestions colorful and engaging for children

CULTURAL FACTS:
- Include 3 meaningful facts about Australia, Australian culture, or Australian life
- Make facts relevant to the story and age-appropriate
- Ensure accuracy and cultural sensitivity
- Focus on positive, educational aspects of Australian culture

MORAL LESSONS:
- Teach positive values like kindness, respect, environmental care, or cultural appreciation
- Make lessons clear but not preachy
- Ensure lessons are relevant to Australian values and community spirit

Respond with ONLY the JSON, no additional text.`;
}

function parseAusKidsStoryResponse(responseText: string, request: AusKidsStoryRequest): AusKidsStory {
  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const story: AusKidsStory = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    story.id = story.id || `story_${Date.now()}`;
    story.generatedAt = story.generatedAt || new Date().toISOString();
    story.ageAppropriate = true;
    story.difficulty = story.difficulty || 'easy';

    console.log('📚 AusKids story generated:', {
      title: story.title,
      theme: story.theme,
      culturalFacts: story.culturalFacts.length
    });

    return story;

  } catch (error) {
    console.error('Error parsing AusKids story response:', error);
    return getFallbackAusKidsStory(request);
  }
}

function getFallbackAusKidsStory(request: AusKidsStoryRequest): AusKidsStory {
  const theme = AUSKIDS_THEMES.find(t => t.id === request.theme);
  
  // Generate a fallback story based on theme
  let story: AusKidsStory;
  
  switch (request.theme) {
    case 'wildlife_adventure':
      story = {
        id: `fallback_${Date.now()}`,
        title: request.userTitle || 'Kangaroo Jack\'s Adventure',
        theme: request.theme,
        content: `Kangaroo Jack lived in the beautiful Australian outback with his family. One sunny morning, Jack noticed that his favorite gum tree was looking sick. The leaves were turning brown and falling off.

"Dad, what's wrong with our tree?" Jack asked his father.

His father, Big Joe, looked worried. "The tree needs more water, Jack. It's been very dry lately."

Jack decided to help. He hopped to the nearby billabong (waterhole) and used his strong tail to carry water back to the tree. Day after day, Jack worked hard, and slowly the tree started to recover.

"Good job, Jack!" said Big Joe. "You've learned an important lesson about caring for our environment."

From that day on, Jack became known as the tree protector of the outback, and all the animals came to him when they needed help with their trees.`,
        characters: ['Kangaroo Jack', 'Big Joe (Father Kangaroo)', 'Other Australian animals'],
        settings: ['Australian outback', 'Billabong (waterhole)', 'Eucalyptus forest'],
        culturalFacts: [
          'Billabong is an Australian Aboriginal word meaning a small lake or waterhole',
          'Kangaroos use their strong tails to balance and can hop at speeds up to 40 km/h',
          'Eucalyptus trees are native to Australia and are very important to Australian wildlife'
        ],
        moralLesson: 'Caring for our environment and helping others makes us good community members',
        ageAppropriate: true,
        visualSuggestions: [
          'Kangaroo Jack hopping through the outback with red dust clouds behind him',
          'The sick eucalyptus tree with brown leaves and Jack looking worried',
          'Jack carrying water in a creative way near a sparkling billabong',
          'A happy ending scene with the healthy tree and Jack surrounded by other Australian animals'
        ],
        readingTime: '3 minutes',
        difficulty: 'easy',
        generatedAt: new Date().toISOString()
      };
      break;
      
    case 'coastal_life':
      story = {
        id: `fallback_${Date.now()}`,
        title: request.userTitle || 'Surfing with Sam',
        theme: request.theme,
        content: `Sam loved living by the beach in Bondi, Sydney. Every morning, she would wake up early to watch the sunrise over the Pacific Ocean. 

One day, Sam decided she wanted to learn to surf like the big kids she saw riding the waves.

"Can you teach me to surf?" Sam asked her older brother, Tom.

Tom smiled. "Of course! But first, you need to understand the ocean. It's powerful and beautiful, but we must always respect it."

Tom taught Sam about rip currents, how to read the waves, and the importance of wearing sunscreen in Australia's strong sun. He showed her how to paddle and stand up on the board.

After many tries, Sam finally caught her first wave! She felt like she was flying over the water.

"Great job, Sam!" Tom cheered. "You're becoming a true Aussie surfer!"

Sam learned that surfing wasn't just about riding waves - it was about respecting the ocean and being part of the beach community.`,
        characters: ['Sam (young surfer)', 'Tom (older brother)', 'Beach community'],
        settings: ['Bondi Beach, Sydney', 'Pacific Ocean', 'Beach house'],
        culturalFacts: [
          'Bondi Beach is one of Australia\'s most famous beaches and a symbol of Australian beach culture',
          'Surfing is deeply connected to Australian coastal lifestyle and community spirit',
          'Australia has some of the strongest UV radiation in the world, making sun protection essential'
        ],
        moralLesson: 'Learning new skills takes practice and patience, and respecting nature is important',
        ageAppropriate: true,
        visualSuggestions: [
          'Sam watching the sunrise over Bondi Beach with surfers in the distance',
          'Tom teaching Sam about ocean safety on the beach',
          'Sam attempting to surf with determination on her face',
          'Sam successfully riding a wave with Tom cheering from the shore'
        ],
        readingTime: '4 minutes',
        difficulty: 'medium',
        generatedAt: new Date().toISOString()
      };
      break;
      
    default:
      story = {
        id: `fallback_${Date.now()}`,
        title: request.userTitle || 'An Australian Adventure',
        theme: request.theme,
        content: `Once upon a time, in the great land of Australia, there lived a curious child named Alex who loved to explore.

Alex discovered that Australia is home to many wonderful things - from the Great Barrier Reef to the Sydney Opera House, from koalas to kangaroos.

"Australia is so big and beautiful!" Alex exclaimed.

Through adventures across different parts of Australia, Alex learned about the importance of respecting nature, celebrating diversity, and being kind to others.

"Every place in Australia has its own special story," Alex realized.

And so Alex became a little ambassador of Australian culture, sharing the wonderful stories and traditions of this amazing country with friends from around the world.`,
        characters: ['Alex (curious child)', 'Various Australian animals', 'Local community members'],
        settings: ['Various Australian locations', 'Natural landscapes', 'Cultural sites'],
        culturalFacts: [
          'Australia is the world\'s sixth-largest country and an island continent',
          'Australia is home to unique wildlife found nowhere else in the world',
          'Australia celebrates its multicultural community with people from over 200 countries'
        ],
        moralLesson: 'Curiosity and respect help us learn about and appreciate different cultures',
        ageAppropriate: true,
        visualSuggestions: [
          'Alex exploring with a map of Australia in hand',
          'Scenes of Australian landmarks and wildlife',
          'Alex meeting diverse people from different backgrounds',
          'A happy ending with Alex sharing stories with friends'
        ],
        readingTime: '3 minutes',
        difficulty: 'easy',
        generatedAt: new Date().toISOString()
      };
  }

  return story;
}
