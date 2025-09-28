import { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  Newspaper, 
  Utensils, 
  Flag, 
  BookOpen,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Heart,
  Lightbulb
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Smart Weather Alerts',
      description: 'Get personalized weather recommendations and safety alerts powered by AI',
      color: 'text-blue-600'
    },
    {
      icon: Flag,
      title: 'AusBoard',
      description: 'Discover amazing facts about Australia\'s rich culture and heritage',
      color: 'text-green-600'
    },
    {
      icon: BookOpen,
      title: 'AusKids Stories',
      description: 'Educational storytelling for children with Australian cultural themes',
      color: 'text-purple-600'
    },
    {
      icon: Utensils,
      title: 'Food Suggestions',
      description: 'Upload food photos and get AI-powered Australian dish recommendations',
      color: 'text-orange-600'
    },
    {
      icon: MapPin,
      title: 'Health Facilities',
      description: 'Find nearby health facilities and emergency services',
      color: 'text-red-600'
    },
    {
      icon: Newspaper,
      title: 'Australian News',
      description: 'Stay updated with the latest Australian news and emergency updates',
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AusGuard</span>
            </div>
            <button 
              onClick={onLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 relative overflow-hidden">
        {/* Australian Visual Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce" style={{animationDelay: '0s'}}>🐨</div>
        <div className="absolute top-32 right-16 text-5xl opacity-20 animate-bounce" style={{animationDelay: '1s'}}>🦘</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-bounce" style={{animationDelay: '2s'}}>🏛️</div>
        <div className="absolute top-40 left-1/3 text-3xl opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}>🌊</div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-4xl">🇦🇺</span>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Your Australian
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Safety Companion</span>
              </h1>
              <span className="text-4xl">🇦🇺</span>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AusGuard helps you stay safe, informed, and connected with Australia through 
              smart weather alerts, cultural insights, and essential safety features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onLogin}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-lg flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Safe & Informed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AusGuard combines cutting-edge AI with Australian expertise to provide 
              personalized safety recommendations and cultural insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden"
              >
                {/* Subtle Australian pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-8 translate-x-8"></div>
                
                <div className={`${feature.color} mb-4 relative z-10`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How AusGuard Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, smart, and designed for everyday Australians
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and set your location for personalized recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Insights</h3>
              <p className="text-gray-600">
                Receive AI-powered weather alerts, cultural facts, and safety recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stay Connected</h3>
              <p className="text-gray-600">
                Explore Australian culture, learn new facts, and stay safe in your community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powered by Advanced AI
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                AusGuard uses Google Gemini AI to analyze weather data, news, and cultural information, 
                providing you with intelligent, personalized recommendations that actually make sense.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Smart weather analysis and safety alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Cultural education and Australian facts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Food suggestions and recipe recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Educational storytelling for children</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-full p-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Weather Safety</h4>
                    <p className="text-sm text-gray-600">AI-powered recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-full p-3">
                    <Flag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cultural Learning</h4>
                    <p className="text-sm text-gray-600">Discover Australian heritage</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-full p-3">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Kids Education</h4>
                    <p className="text-sm text-gray-600">Stories that teach and inspire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Australian Visuals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Made for Australia
            </h2>
            <p className="text-lg text-gray-600">
              Designed specifically for Australian weather, culture, and lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sydney Opera House */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold mb-2">Sydney Opera House</h3>
                <p className="text-blue-100 text-sm">
                  Iconic Australian landmark and UNESCO World Heritage site
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            </div>

            {/* Great Barrier Reef */}
            <div className="bg-gradient-to-br from-cyan-400 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🐠</div>
                <h3 className="text-xl font-bold mb-2">Great Barrier Reef</h3>
                <p className="text-cyan-100 text-sm">
                  World's largest coral reef system, visible from space
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Uluru */}
            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🪨</div>
                <h3 className="text-xl font-bold mb-2">Uluru</h3>
                <p className="text-orange-100 text-sm">
                  Sacred Indigenous site and natural wonder in the Red Centre
                </p>
              </div>
              <div className="absolute top-0 left-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-10 -translate-x-10"></div>
            </div>

            {/* Australian Wildlife */}
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🐨</div>
                <h3 className="text-xl font-bold mb-2">Unique Wildlife</h3>
                <p className="text-green-100 text-sm">
                  Home to koalas, kangaroos, and many unique Australian species
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-white bg-opacity-10 rounded-full translate-y-14 translate-x-14"></div>
            </div>
          </div>

          {/* Australian Cities */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🏙️</div>
              <p className="font-medium text-gray-900">Sydney</p>
              <p className="text-sm text-gray-600">NSW</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🌆</div>
              <p className="font-medium text-gray-900">Melbourne</p>
              <p className="text-sm text-gray-600">VIC</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🌴</div>
              <p className="font-medium text-gray-900">Brisbane</p>
              <p className="text-sm text-gray-600">QLD</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🏖️</div>
              <p className="font-medium text-gray-900">Perth</p>
              <p className="text-sm text-gray-600">WA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience AusGuard?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Australians who trust AusGuard for their safety and cultural education needs.
          </p>
          <button 
            onClick={onLogin}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">AusGuard</span>
              </div>
              <p className="text-gray-400">
                Your trusted companion for safety, culture, and community in Australia.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Weather Alerts</li>
                <li>Cultural Facts</li>
                <li>Kids Stories</li>
                <li>Food Suggestions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Users className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🇦🇺</span>
              <p className="text-lg">&copy; 2024 AusGuard. Made with ❤️ for Australia.</p>
              <span className="text-2xl">🇦🇺</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>🐨 Koala Friendly</span>
              <span>•</span>
              <span>🦘 Kangaroo Approved</span>
              <span>•</span>
              <span>🏛️ Sydney Tested</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
