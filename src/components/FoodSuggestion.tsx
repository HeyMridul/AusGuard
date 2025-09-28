import { useState, useRef } from 'react';
import { analyzeFoodImage } from '../lib/foodAnalysis';
import { FoodAnalysis, AustralianDish } from '../types';
import { 
  Upload, 
  Camera, 
  Utensils, 
  Clock, 
  Users, 
  ChefHat, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Star,
  MapPin
} from 'lucide-react';

export default function FoodSuggestion() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file is too large. Please select an image smaller than 10MB');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      setError(null);

      const result = await analyzeFoodImage(selectedImage);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Utensils className="h-8 w-8 text-orange-600" />
          <span>Australian Food Suggestions</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Upload a photo of your ingredients and discover authentic Australian dishes you can make!
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Food Image</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Selected food"
                className="max-h-64 mx-auto rounded-lg shadow-sm"
              />
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChefHat className="h-5 w-5" />
                  <span>{loading ? 'Analyzing...' : 'Get Australian Recipe Suggestions'}</span>
                </button>
                
                <button
                  onClick={resetAnalysis}
                  className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Different Image</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-orange-100 rounded-full p-4">
                  <Camera className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here, or click to browse
                </h3>
                <p className="text-gray-500 text-sm">
                  Supports JPG, PNG, GIF up to 10MB
                </p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 mx-auto"
              >
                <Upload className="h-5 w-5" />
                <span>Choose File</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analyzing Your Ingredients</h3>
              <p className="text-gray-600 text-sm">
                Our AI is identifying the food items and finding the best Australian recipes for you...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Detected Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Detected Ingredients</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.detectedItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                  </div>
                  {item.quantity && (
                    <p className="text-sm text-gray-600 mb-1">Quantity: {item.quantity}</p>
                  )}
                  {item.condition && (
                    <p className="text-sm text-gray-600">Condition: {item.condition}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Analysis Confidence</span>
                <span className="font-medium text-gray-900">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
              {analysis.confidence < 0.5 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  ⚠️ Low confidence analysis - suggestions may not match your ingredients perfectly
                </div>
              )}
            </div>
          </div>

          {/* Suggested Dishes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <span>Suggested Australian Dishes</span>
            </h2>
            
            <div className="space-y-6">
              {analysis.suggestedDishes.map((dish, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{dish.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(dish.difficulty)}`}>
                          {getDifficultyIcon(dish.difficulty)} {dish.difficulty.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{dish.description}</p>
                      
                      {dish.traditionalOrigin && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>Traditional from: {dish.traditionalOrigin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Prep Time</div>
                        <div className="text-gray-600">{dish.prepTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <ChefHat className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Cook Time</div>
                        <div className="text-gray-600">{dish.cookTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Serves</div>
                        <div className="text-gray-600">{dish.serves} people</div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Ingredients:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dish.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <Star className="h-3 w-3 text-orange-500 flex-shrink-0" />
                          <span className="text-gray-700">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                    <ol className="space-y-2">
                      {dish.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-sm">
                          <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {dish.tips && dish.tips.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Cooking Tips:</h4>
                      <ul className="space-y-1">
                        {dish.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-blue-800">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-orange-900 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Camera className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-orange-900 mb-1">1. Upload Photo</h4>
            <p className="text-orange-700">Take or upload a photo of your ingredients</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-orange-900 mb-1">2. AI Analysis</h4>
            <p className="text-orange-700">Our AI identifies ingredients and suggests recipes</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-orange-900 mb-1">3. Cook & Enjoy</h4>
            <p className="text-orange-700">Follow the recipes to create delicious Australian dishes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
