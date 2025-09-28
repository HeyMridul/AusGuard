import { AusBoardContent, AustralianFact } from '../types';

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

export async function generateAusBoardContent(): Promise<AusBoardContent> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback AusBoard content');
    return getFallbackAusBoardContent();
  }

  try {
    const prompt = buildAusBoardPrompt();
    
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

    return parseAusBoardResponse(contentText);

  } catch (error) {
    console.error('Error calling Gemini API for AusBoard:', error);
    return getFallbackAusBoardContent();
  }
}

function buildAusBoardPrompt(): string {
  const today = new Date().toLocaleDateString('en-AU');
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

  return `You are an expert on Australian culture, history, geography, and society. Create engaging, educational, and positive content about Australia for the AusBoard feature.

Today is ${today} and it's ${timeOfDay} in Australia.

Generate a JSON response with the following structure:

{
  "dailyFact": {
    "id": "unique_id",
    "category": "history|geography|culture|wildlife|sports|food|language|innovation|nature|people",
    "title": "Engaging title for today's fact",
    "content": "Detailed explanation of the fact (2-3 sentences)",
    "interestingFact": "A surprising or amazing detail",
    "didYouKnow": "Additional fascinating information",
    "culturalSignificance": "Why this matters to Australian culture",
    "relatedLocation": "Specific place in Australia",
    "state": "Australian state/territory",
    "difficulty": "easy|medium|advanced",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "weeklySpotlight": {
    "id": "unique_id",
    "category": "different from daily fact",
    "title": "Weekly spotlight title",
    "content": "Comprehensive content about this week's focus",
    "interestingFact": "Surprising element",
    "didYouKnow": "Educational detail",
    "culturalSignificance": "Cultural importance",
    "relatedLocation": "Relevant Australian location",
    "state": "Australian state/territory",
    "difficulty": "easy|medium|advanced",
    "tags": ["tag1", "tag2"]
  },
  "culturalMoment": {
    "title": "Title of cultural moment or tradition",
    "description": "Description of the cultural practice",
    "significance": "Why this is important to Australian identity",
    "relatedFacts": ["fact 1", "fact 2", "fact 3"]
  },
  "funTrivia": {
    "question": "Interesting trivia question about Australia",
    "answer": "The correct answer",
    "explanation": "Why this answer is correct and interesting",
    "category": "trivia category"
  },
  "australianism": {
    "word": "Australian slang word or phrase",
    "meaning": "What it means",
    "example": "Example sentence using the word",
    "origin": "Where this word/phrase comes from"
  },
  "lastUpdated": "ISO timestamp"
}

CONTENT GUIDELINES:
1. Make content positive, educational, and culturally respectful
2. Include diverse aspects of Australian culture (Indigenous, multicultural, modern)
3. Focus on lesser-known facts that inspire curiosity
4. Ensure accuracy and cultural sensitivity
5. Make content engaging for all ages
6. Include specific locations and states when relevant
7. Balance fun facts with meaningful cultural education

AVOID:
- Stereotypes or oversimplifications
- Controversial political topics
- Negative portrayals of any group
- Overly complex academic content

Respond with ONLY the JSON, no additional text.`;
}

function parseAusBoardResponse(responseText: string): AusBoardContent {
  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const content: AusBoardContent = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    content.lastUpdated = content.lastUpdated || new Date().toISOString();

    console.log('🇦🇺 AusBoard content generated:', {
      dailyFact: content.dailyFact.title,
      weeklySpotlight: content.weeklySpotlight.title,
      culturalMoment: content.culturalMoment.title
    });

    return content;

  } catch (error) {
    console.error('Error parsing AusBoard response:', error);
    return getFallbackAusBoardContent();
  }
}

function getFallbackAusBoardContent(): AusBoardContent {
  const today = new Date();
  const facts = [
    {
      dailyFact: {
        id: `fact-${today.getDate()}-${today.getMonth()}`,
        category: 'wildlife' as const,
        title: 'The Great Barrier Reef',
        content: 'The Great Barrier Reef is the world\'s largest coral reef system, stretching over 2,300 kilometres along the Queensland coast. It\'s home to over 1,500 species of fish and 400 types of coral.',
        interestingFact: 'The reef is so large it can be seen from space!',
        didYouKnow: 'It took thousands of years for the reef to form, with some parts being over 18 million years old.',
        culturalSignificance: 'The reef holds deep spiritual significance for Aboriginal and Torres Strait Islander peoples, featuring in many Dreamtime stories.',
        relatedLocation: 'Cairns, Queensland',
        state: 'QLD',
        difficulty: 'easy' as const,
        tags: ['marine', 'unesco', 'biodiversity']
      },
      weeklySpotlight: {
        id: `spotlight-${today.getDate()}`,
        category: 'culture' as const,
        title: 'ANZAC Day Tradition',
        content: 'ANZAC Day commemorates Australian and New Zealand soldiers who served in wars and conflicts. It\'s marked by dawn services, marches, and the playing of the Last Post.',
        interestingFact: 'The dawn service tradition began because dawn was the time of the original ANZAC landing at Gallipoli.',
        didYouKnow: 'ANZAC biscuits were originally sent to soldiers by families and were made to last the long journey.',
        culturalSignificance: 'ANZAC Day represents mateship, courage, and the Australian spirit of looking after each other.',
        relatedLocation: 'Australian War Memorial, Canberra',
        state: 'ACT',
        difficulty: 'medium' as const,
        tags: ['remembrance', 'tradition', 'history']
      }
    }
  ];

  const randomFact = facts[Math.floor(Math.random() * facts.length)];

  return {
    ...randomFact,
    culturalMoment: {
      title: 'The Art of Yarning',
      description: 'Yarning is an Indigenous Australian tradition of storytelling that builds relationships and shares knowledge through conversation.',
      significance: 'This practice teaches us the value of listening, sharing stories, and building community connections.',
      relatedFacts: [
        'Yarning circles are used in schools and workplaces for respectful discussion',
        'The practice emphasises equality - everyone has a voice',
        'It\'s about building relationships, not just sharing information'
      ]
    },
    funTrivia: {
      question: 'What percentage of Australians live within 50km of the coast?',
      answer: '85%',
      explanation: 'Most Australians live near the coast because the interior is largely desert. This coastal lifestyle has shaped Australian culture, from surfing to seafood.',
      category: 'geography'
    },
    australianism: {
      word: 'Fair dinkum',
      meaning: 'Genuine, authentic, or true',
      example: 'That\'s a fair dinkum Aussie barbecue, mate!',
      origin: 'Originally from British dialect meaning "fair dealing", adopted in Australia to mean genuine or honest'
    },
    lastUpdated: new Date().toISOString()
  };
}
