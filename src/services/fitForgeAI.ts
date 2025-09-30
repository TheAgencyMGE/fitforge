// FitForge AI Service - Production Ready with Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WorkoutPlan, WeeklySchedule, ProgressMetrics, AdaptationRecommendations, WorkoutSession } from '@/types/fitness';
import type { HealthyRecipe, MacroGoals, NutritionSummary } from '@/types/nutrition';

export class FitForgeAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Gemini API key is not configured. Please set VITE_GOOGLE_GEMINI_API_KEY in your environment variables.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower for safety and consistency in fitness guidance
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    });
  }

  async generateWorkoutSchedule(
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
    goals: string[],
    availableDays: number,
    equipment: string[],
    limitations: string[]
  ): Promise<WeeklySchedule> {
    const prompt = `Create a safe, beginner-friendly workout schedule for someone with:

    Fitness Level: ${fitnessLevel}
    Goals: ${goals.join(', ')}
    Available Days Per Week: ${availableDays}
    Equipment: ${equipment.join(', ')}
    Physical Limitations: ${limitations.join(', ') || 'None'}
    
    CRITICAL: Prioritize proper form, injury prevention, and gradual progression. Include rest days.
    
    Provide workout plan in JSON format:
    {
      "monday": {
        "day": "Monday",
        "workout_type": "strength",
        "exercises": [
          {
            "exercise_id": "push_ups",
            "name": "Push-ups",
            "sets": 3,
            "reps": "8-12",
            "rest_time": "60 seconds",
            "form_cues": ["Keep body straight", "Full range of motion"],
            "modifications": ["Knee push-ups for beginners", "Incline push-ups"]
          }
        ],
        "duration_minutes": 45,
        "warmup": ["5 min light cardio", "Dynamic stretching"],
        "cooldown": ["5 min walking", "Static stretching"],
        "notes": "Focus on form over speed"
      }
    }

    Ensure all exercises are safe for beginners and include proper progression.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up the response to ensure valid JSON
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse) as WeeklySchedule;
    } catch (error) {
      console.error('Workout generation error:', error);
      return this.getDefaultWorkoutSchedule(fitnessLevel);
    }
  }

  async generateHealthyRecipe(
    calorieTarget: number,
    macroGoals: MacroGoals,
    dietaryRestrictions: string[],
    cookingTime: number,
    mealType: string
  ): Promise<HealthyRecipe> {
    const prompt = `Create a healthy, balanced ${mealType} recipe with:

    Calorie Target: ${calorieTarget} calories (±50)
    Macros: ${macroGoals.protein}g protein, ${macroGoals.carbs}g carbs, ${macroGoals.fats}g fats
    Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
    Cooking Time: ${cookingTime} minutes maximum
    
    Provide complete recipe in JSON:
    {
      "id": "recipe_001",
      "recipe_name": "Protein-Packed Breakfast Bowl",
      "meal_type": "${mealType}",
      "servings": 1,
      "prep_time_minutes": 10,
      "cook_time_minutes": 15,
      "difficulty": "easy",
      "ingredients": [
        {
          "ingredient": "Greek yogurt",
          "amount": "150",
          "unit": "g",
          "calories": 130,
          "protein": 15,
          "carbs": 9,
          "fats": 4,
          "fiber": 0,
          "optional": false
        }
      ],
      "instructions": [
        "Step 1: Prepare ingredients",
        "Step 2: Cook as directed"
      ],
      "nutrition_summary": {
        "total_calories": ${calorieTarget},
        "protein": ${macroGoals.protein},
        "carbs": ${macroGoals.carbs},
        "fats": ${macroGoals.fats},
        "fiber": 8,
        "sugar": 12,
        "sodium": 300
      },
      "meal_prep_tips": ["Can be prepared the night before"],
      "health_benefits": ["High in protein for muscle building"],
      "variations": ["Add berries for extra antioxidants"],
      "dietary_tags": ["high-protein", "gluten-free"]
    }

    Focus on whole foods, balanced nutrition, and practical home cooking.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse) as HealthyRecipe;
    } catch (error) {
      console.error('Recipe generation error:', error);
      return this.getDefaultRecipe(mealType, calorieTarget);
    }
  }

  async analyzeProgressAndAdapt(
    workoutHistory: WorkoutSession[],
    progressMetrics: ProgressMetrics,
    userFeedback: string
  ): Promise<AdaptationRecommendations> {
    const prompt = `Analyze this user's fitness progress and provide adaptive recommendations:

    Recent Workouts: ${JSON.stringify(workoutHistory.slice(-5))}
    Progress Metrics: ${JSON.stringify(progressMetrics)}
    User Feedback: "${userFeedback}"
    
    IMPORTANT: Prioritize sustainable progress and injury prevention over rapid gains.
    
    Provide analysis in JSON:
    {
      "progress_assessment": {
        "strength_gains": "Good progression in upper body exercises",
        "consistency": "Excellent - 5 workouts per week",
        "recovery_quality": "Adequate rest between sessions",
        "potential_issues": ["Lower back tightness reported"]
      },
      "adaptations": [
        {
          "area": "Lower body strength",
          "current_approach": "Bodyweight squats 3x12",
          "recommendation": "Add goblet squats with light weight",
          "reasoning": "Ready for progression based on form improvement",
          "implementation_tips": ["Start with 5-8 reps", "Focus on depth"]
        }
      ],
      "motivational_insights": ["Great consistency this week!"],
      "warning_signs_detected": [],
      "celebrate_wins": ["Completed first full push-up!"],
      "next_milestones": [
        {
          "goal": "Increase push-up strength",
          "timeline": "2 weeks",
          "steps": ["Add 1 rep per week", "Focus on negative control"]
        }
      ]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse) as AdaptationRecommendations;
    } catch (error) {
      console.error('Progress analysis error:', error);
      return this.getDefaultProgressAnalysis();
    }
  }

  async generateMotivationalMessage(
    userName: string,
    currentStreak: number,
    recentProgress: string,
    mood: number
  ): Promise<string> {
    const prompt = `Generate a personalized, encouraging message for ${userName}:
    
    Current workout streak: ${currentStreak} days
    Recent progress: ${recentProgress}
    Current mood (1-10): ${mood}
    
    Create a motivational message that:
    - Acknowledges their progress
    - Encourages consistency over perfection
    - Is positive and specific to their situation
    - Keeps them focused on healthy habits
    
    Keep it under 100 words and genuinely encouraging.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Motivation generation error:', error);
      return `Great work, ${userName}! Every workout counts toward your fitness journey. Keep up the momentum! 💪`;
    }
  }

  // Default fallback schedules for error cases
  private getDefaultWorkoutSchedule(fitnessLevel: string): WeeklySchedule {
    return {
      "monday": {
        "day": "Monday",
        "workout_type": "strength",
        "exercises": [
          {
            "exercise_id": "bodyweight_squats",
            "name": "Bodyweight Squats",
            "sets": 3,
            "reps": "10-15",
            "rest_time": "60 seconds",
            "form_cues": ["Keep chest up", "Knees track over toes"],
            "modifications": ["Hold onto chair for balance"]
          }
        ],
        "duration_minutes": 30,
        "warmup": ["5 min light movement"],
        "cooldown": ["5 min stretching"],
        "notes": "Start slow and focus on form"
      },
      "tuesday": {
        "day": "Tuesday",
        "workout_type": "rest",
        "exercises": [],
        "duration_minutes": 0,
        "warmup": [],
        "cooldown": [],
        "notes": "Rest day - light walking optional"
      }
    };
  }

  private getDefaultRecipe(mealType: string, calories: number): HealthyRecipe {
    return {
      id: "default_recipe",
      recipe_name: `Healthy ${mealType}`,
      meal_type: mealType as any,
      servings: 1,
      prep_time_minutes: 10,
      cook_time_minutes: 5,
      difficulty: "easy",
      ingredients: [
        {
          ingredient: "Greek yogurt",
          amount: "200",
          unit: "g",
          calories: calories * 0.6,
          protein: 20,
          carbs: 15,
          fats: 5,
          fiber: 0,
          optional: false
        }
      ],
      instructions: ["Mix ingredients", "Serve immediately"],
      nutrition_summary: {
        total_calories: calories,
        protein: 20,
        carbs: 20,
        fats: 10,
        fiber: 5,
        sugar: 8,
        sodium: 100,
        vitamins: { "vitamin_c": 10, "vitamin_d": 5 },
        minerals: { "calcium": 150, "iron": 2 }
      },
      meal_prep_tips: ["Can be prepared ahead"],
      health_benefits: ["Balanced nutrition"],
      variations: ["Add your favorite toppings"],
      dietary_tags: ["healthy"],
      cost_estimate: "low"
    };
  }

  private getDefaultProgressAnalysis(): AdaptationRecommendations {
    return {
      progress_assessment: {
        strength_gains: "Making steady progress",
        consistency: "Keep up the great work",
        recovery_quality: "Recovery looks good",
        potential_issues: []
      },
      adaptations: [],
      motivational_insights: ["You're doing great!"],
      warning_signs_detected: [],
      celebrate_wins: ["Consistency is your strength"],
      next_milestones: []
    };
  }
}

// Singleton instance
export const fitForgeAI = new FitForgeAIService();