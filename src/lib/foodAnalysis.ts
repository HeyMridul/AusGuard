import { FoodAnalysis, FoodItem, AustralianDish } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface GeminiVisionRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
}

interface GeminiVisionResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function analyzeFoodImage(imageFile: File): Promise<FoodAnalysis> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback analysis');
    return getFallbackFoodAnalysis();
  }

  try {
    console.log('🍽️ Starting food image analysis...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    console.log('📸 Image converted to base64, length:', base64Image.length);
    
    const prompt = buildFoodAnalysisPrompt();
    
    const requestBody: GeminiVisionRequest = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: base64Image
            }
          }
        ]
      }]
    };

    console.log('🚀 Sending request to Gemini Vision API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiVisionResponse = await response.json();
    console.log('✅ Received response from Gemini API');
    
    const analysisText = data.candidates[0]?.content?.parts[0]?.text;

    if (!analysisText) {
      console.error('❌ No analysis text in response');
      throw new Error('No analysis returned from Gemini');
    }

    console.log('📝 Analysis text length:', analysisText.length);
    return parseFoodAnalysisResponse(analysisText);

  } catch (error) {
    console.error('❌ Error calling Gemini Vision API:', error);
    console.log('🔄 Falling back to mock analysis');
    return getFallbackFoodAnalysis();
  }
}

function buildFoodAnalysisPrompt(): string {
  return `You are an AI assistant specialized in Australian cuisine and food analysis. 

IMPORTANT: You must analyze the ACTUAL IMAGE provided and identify the specific food items visible in the image. Do not make assumptions or provide generic suggestions.

Look carefully at the uploaded image and identify:
1. What specific food items are visible
2. Their approximate quantities
3. Their condition (fresh, ripe, etc.)

Then suggest Australian dishes that can be made with THESE SPECIFIC ingredients.

Provide a JSON response with the following structure:

{
  "detectedItems": [
    {
      "name": "specific food item name",
      "category": "vegetable|fruit|meat|seafood|dairy|grain|herb|spice|other",
      "quantity": "estimated amount or portion",
      "condition": "fresh|frozen|canned|dried"
    }
  ],
  "suggestedDishes": [
    {
      "name": "Dish name",
      "description": "Brief description of the dish",
      "difficulty": "easy|medium|hard",
      "prepTime": "preparation time (e.g., '15 minutes')",
      "cookTime": "cooking time (e.g., '30 minutes')",
      "serves": 4,
      "ingredients": ["list of all ingredients needed"],
      "instructions": ["step-by-step cooking instructions"],
      "tips": ["helpful cooking tips"],
      "traditionalOrigin": "Australian region or cultural origin if applicable"
    }
  ],
  "confidence": 0.85,
  "analysisTimestamp": "ISO timestamp"
}

REQUIREMENTS:
1. Identify ALL visible food items in the image
2. Suggest 3-5 authentic Australian dishes that can be made with the detected ingredients
3. Focus on traditional Australian cuisine, modern Australian dishes, and fusion recipes popular in Australia
4. Include iconic Australian dishes like:
   - Meat pies, sausage rolls, lamingtons
   - Barramundi, prawns, oysters
   - Damper bread, ANZAC biscuits
   - Pavlova, fairy bread
   - Modern fusion dishes with native ingredients
   - BBQ classics, roast dinners, seafood platters

5. Be specific about Australian ingredients and cooking methods
6. Include preparation and cooking times
7. Make recipes practical for home cooking
8. Consider seasonal availability in Australia

If you cannot clearly identify food items, suggest general Australian dishes that could be made with common ingredients.

Respond with ONLY the JSON, no additional text.`;
}

function parseFoodAnalysisResponse(responseText: string): FoodAnalysis {
  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const analysis: FoodAnalysis = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    analysis.analysisTimestamp = analysis.analysisTimestamp || new Date().toISOString();
    analysis.confidence = analysis.confidence || 0.7;

    console.log('🍽️ Food analysis completed:', {
      itemsDetected: analysis.detectedItems.length,
      dishesSuggested: analysis.suggestedDishes.length,
      confidence: analysis.confidence
    });

    return analysis;

  } catch (error) {
    console.error('Error parsing food analysis response:', error);
    return getFallbackFoodAnalysis();
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

function getFallbackFoodAnalysis(): FoodAnalysis {
  // This fallback should only be used when no image is provided or API fails completely
  // For actual image analysis, we should try to provide basic visual analysis
  return {
    detectedItems: [
      {
        name: 'Unable to detect ingredients',
        category: 'other',
        quantity: 'Unknown',
        condition: 'unknown'
      }
    ],
    suggestedDishes: [
      {
        name: 'Classic Australian Banana Bread',
        description: 'A moist and delicious banana bread that\'s perfect for morning tea or afternoon snacks.',
        difficulty: 'easy',
        prepTime: '15 minutes',
        cookTime: '60 minutes',
        serves: 8,
        ingredients: [
          '3 ripe bananas, mashed',
          '1/3 cup melted butter',
          '1 tsp baking soda',
          'Pinch of salt',
          '3/4 cup sugar',
          '1 large egg, beaten',
          '1 tsp vanilla extract',
          '1 1/2 cups all-purpose flour'
        ],
        instructions: [
          'Preheat oven to 175°C and grease a 9x5 inch loaf pan',
          'In a large bowl, mash the bananas with a fork',
          'Mix in the melted butter, then add baking soda and salt',
          'Stir in sugar, beaten egg, and vanilla extract',
          'Mix in the flour until just combined',
          'Pour batter into prepared loaf pan',
          'Bake for 60-65 minutes until a toothpick comes out clean',
          'Cool in pan for 10 minutes, then turn out onto wire rack'
        ],
        tips: [
          'Use very ripe bananas for best flavor',
          'Don\'t overmix the batter',
          'Can add walnuts or chocolate chips for extra flavor'
        ],
        traditionalOrigin: 'Australian home baking'
      },
      {
        name: 'Aussie Banana Pancakes',
        description: 'Fluffy pancakes with mashed banana, perfect for a weekend breakfast.',
        difficulty: 'easy',
        prepTime: '10 minutes',
        cookTime: '15 minutes',
        serves: 4,
        ingredients: [
          '2 ripe bananas, mashed',
          '1 cup self-raising flour',
          '1 tbsp sugar',
          '1 cup milk',
          '1 egg',
          '2 tbsp melted butter',
          'Maple syrup or golden syrup to serve'
        ],
        instructions: [
          'Mash bananas in a large bowl',
          'Add flour and sugar, mix well',
          'Whisk in milk, egg, and melted butter',
          'Heat a non-stick pan over medium heat',
          'Pour 1/4 cup batter for each pancake',
          'Cook until bubbles form on surface, then flip',
          'Cook for another 1-2 minutes until golden',
          'Serve with syrup and extra banana slices'
        ],
        tips: [
          'Keep pancakes warm in oven while cooking the rest',
          'Use a non-stick pan for best results'
        ],
        traditionalOrigin: 'Australian breakfast tradition'
      },
      {
        name: 'Banana and Coconut Slice',
        description: 'A classic Australian slice combining banana and coconut in a delicious treat.',
        difficulty: 'easy',
        prepTime: '20 minutes',
        cookTime: '25 minutes',
        serves: 12,
        ingredients: [
          '2 ripe bananas, mashed',
          '1/2 cup desiccated coconut',
          '1/2 cup brown sugar',
          '1/2 cup self-raising flour',
          '1/4 cup melted butter',
          '1 egg',
          '1 tsp vanilla extract',
          'Icing sugar for dusting'
        ],
        instructions: [
          'Preheat oven to 180°C and line a slice tin',
          'Mix mashed banana, coconut, and brown sugar',
          'Add flour and mix well',
          'Stir in melted butter, egg, and vanilla',
          'Spread mixture into prepared tin',
          'Bake for 25 minutes until golden brown',
          'Cool completely before cutting into squares',
          'Dust with icing sugar before serving'
        ],
        tips: [
          'Let the slice cool completely before cutting',
          'Store in an airtight container for up to 3 days'
        ],
        traditionalOrigin: 'Australian afternoon tea'
      }
    ],
    confidence: 0.3,
    analysisTimestamp: new Date().toISOString()
  };
}
