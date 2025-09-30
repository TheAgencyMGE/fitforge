# FitForge - AI-Powered Fitness & Nutrition Platform

FitForge is a comprehensive fitness and nutrition platform that leverages artificial intelligence to provide personalized workout plans, healthy recipes, and intelligent progress tracking. Our mission is to make fitness accessible, sustainable, and effective for everyone, regardless of their experience level.

## 🌟 Features

### 🏋️‍♂️ AI-Powered Workouts
- **Personalized Workout Plans**: Custom routines based on your fitness level, goals, and available equipment
- **Adaptive Training**: Plans that evolve with your progress
- **Exercise Library**: Comprehensive database with proper form instructions
- **Progress Tracking**: Monitor your strength gains, endurance improvements, and body composition changes

### 🥗 Smart Nutrition
- **AI Recipe Generator**: Healthy, delicious recipes tailored to your dietary preferences and goals
- **Macro Tracking**: Intelligent macronutrient planning and monitoring
- **Meal Planning**: Weekly meal prep suggestions with shopping lists
- **Dietary Accommodations**: Support for various diets (vegan, keto, Mediterranean, etc.)

### 📊 Intelligent Analytics
- **Progress Visualization**: Beautiful charts and graphs showing your fitness journey
- **Performance Insights**: AI-driven recommendations for optimization
- **Goal Setting**: SMART goal framework with milestone tracking
- **Habit Formation**: Build sustainable fitness and nutrition habits

### 🤝 Community & Accountability
- **Social Features**: Connect with like-minded fitness enthusiasts
- **Progress Sharing**: Celebrate victories and get motivation
- **Expert Support**: Access to certified trainers and nutritionists
- **Challenge System**: Participate in fitness challenges and competitions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm (we recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Google Gemini AI API key
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheAgencyMGE/steady-start-fit.git
   cd steady-start-fit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your API keys and Firebase configuration
   ```bash
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google Gemini AI API Key
   VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see FitForge in action!

## 🛠️ Built With

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Hooks & Context API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini AI
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting

## 📱 Features Overview

### User Authentication
- Secure sign-up and login with Firebase Auth
- Profile management with fitness goals and preferences
- Social authentication options

### Workout Generation
- AI-powered workout creation based on:
  - Fitness level (beginner, intermediate, advanced)
  - Available equipment
  - Time constraints
  - Physical limitations
  - Personal goals

### Nutrition Planning
- Recipe suggestions based on dietary preferences
- Macro-based meal planning
- Shopping list generation
- Nutrition tracking and analysis

### Progress Tracking
- Weight and body composition monitoring
- Workout performance metrics
- Photo progress tracking
- Achievement system

## 🤝 Contributing

We welcome contributions to FitForge! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📧 Email: support@fitforge.ai
- 💬 Discord: [Join our community](https://discord.gg/fitforge)
- 📖 Documentation: [docs.fitforge.ai](https://docs.fitforge.ai)

## 🔥 Why FitForge?

FitForge isn't just another fitness app. We believe that sustainable fitness success comes from:

1. **Personalization**: No two people are the same, so why should their fitness plans be?
2. **Intelligence**: Our AI learns from your progress and adapts accordingly
3. **Simplicity**: Complex fitness concepts made simple and actionable
4. **Community**: Success is better when shared with others
5. **Science**: Evidence-based approaches to fitness and nutrition

Start your transformation today with FitForge - where AI meets fitness! 💪
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/64c3f6ba-8daf-4a1f-8ea4-5f13c656bf26) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
