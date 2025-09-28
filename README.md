# AusGuard - Your Australian Safety Companion

AusGuard is a smart safety and cultural app designed specifically for Australians. It uses AI to provide personalized weather alerts, cultural insights, and safety recommendations to help you stay informed and connected with Australia.

## What is AusGuard?

AusGuard is like having a knowledgeable friend who's always looking out for you. It combines real-time weather data, Australian news, and cultural information to give you practical advice for your day-to-day life.

### Key Features

- **Smart Weather Alerts** - Get personalized weather recommendations and safety alerts powered by AI
- **AusBoard** - Discover amazing facts about Australia's rich culture and heritage
- **AusKids Stories** - Educational storytelling for children with Australian cultural themes
- **Food Suggestions** - Upload food photos and get AI-powered Australian dish recommendations
- **Health Facilities** - Find nearby health facilities and emergency services
- **Australian News** - Stay updated with the latest Australian news and emergency updates

## How to Run Locally

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ausguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_NEWS_API_KEY=your_news_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   **Note**: The app works without these API keys, but you'll get better features with them:
   - **NewsAPI**: For real Australian news (get free key at [newsapi.org](https://newsapi.org))
   - **Gemini AI**: For smart weather suggestions and cultural content (get free key at [Google AI Studio](https://makersuite.google.com/app/apikey))
   - **Supabase**: For user accounts (optional - app works without it)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the app in action.

## How It Works

1. **Landing Page** - Beautiful introduction to AusGuard's features
2. **Sign Up/Login** - Create an account or sign in (works without database)
3. **Dashboard** - Your personalized safety and cultural hub
4. **Weather** - Smart weather recommendations and alerts
5. **AusBoard** - Daily Australian cultural facts and insights
6. **AusKids** - Educational stories for children
7. **Food** - AI-powered recipe suggestions
8. **News** - Latest Australian news and updates
9. **Health** - Find nearby health facilities

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Google Gemini AI** - Smart content generation
- **NewsAPI** - Real-time news data
- **Supabase** - User authentication (optional)

## Features in Detail

### Smart Weather Alerts
Get AI-powered recommendations about what to wear, whether to bring an umbrella, and what activities are perfect for the current weather conditions.

### AusBoard Cultural Facts
Discover fascinating facts about Australia daily, including Indigenous culture, wildlife, traditions, and modern Australian life.

### AusKids Educational Stories
Create personalized stories for children that teach Australian culture, values, and traditions through engaging narratives.

### Food Suggestions
Upload photos of ingredients and get suggestions for traditional Australian dishes you can make with them.

### Real-time News
Stay updated with the latest Australian news, filtered by your state for relevant local information.

## Contributing

We welcome contributions! Whether it's fixing bugs, adding features, or improving documentation, your help makes AusGuard better for everyone.

## License

This project is open source and available under the MIT License.

## Support

If you run into any issues or have questions, please open an issue on GitHub or contact us.

---

Made with ❤️ for Australia
