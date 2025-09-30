// FitForge Nutrition Service - Production Ready
import type { MacroGoals, NutritionProfile } from '@/types/nutrition';

export class NutritionService {
  // Calculate Total Daily Energy Expenditure using Mifflin-St Jeor Equation
  calculateTDEE(
    weight: number, // kg
    height: number, // cm
    age: number,
    gender: 'male' | 'female',
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
  ): number {
    // Calculate Basal Metabolic Rate (BMR)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multipliers based on research
    const activityMultipliers = {
      'sedentary': 1.2,      // Little to no exercise
      'light': 1.375,        // Light exercise 1-3 days/week
      'moderate': 1.55,      // Moderate exercise 3-5 days/week
      'active': 1.725,       // Heavy exercise 6-7 days/week
      'very-active': 1.9     // Very heavy exercise, physical job
    };
    
    return Math.round(bmr * activityMultipliers[activityLevel]);
  }

  // Calculate optimal macronutrient distribution
  calculateMacros(calories: number, goal: 'lose' | 'maintain' | 'gain'): MacroGoals {
    let proteinPercent: number;
    let carbPercent: number;
    let fatPercent: number;
    
    switch(goal) {
      case 'lose':
        // Higher protein for satiety and muscle preservation during deficit
        proteinPercent = 0.35;
        fatPercent = 0.30;
        carbPercent = 0.35;
        break;
      case 'gain':
        // Balanced approach with adequate carbs for energy and recovery
        proteinPercent = 0.25;
        fatPercent = 0.25;
        carbPercent = 0.50;
        break;
      default: // maintain
        // Balanced maintenance macros
        proteinPercent = 0.30;
        fatPercent = 0.30;
        carbPercent = 0.40;
    }
    
    return {
      calories,
      protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbPercent) / 4),     // 4 cal per gram
      fats: Math.round((calories * fatPercent) / 9)        // 9 cal per gram
    };
  }

  // Adjust calories based on goal
  calculateTargetCalories(tdee: number, goal: 'lose' | 'maintain' | 'gain'): number {
    switch(goal) {
      case 'lose':
        // Moderate deficit of 500 calories (1 lb/week loss)
        return Math.max(1200, tdee - 500); // Don't go below 1200 for safety
      case 'gain':
        // Moderate surplus of 300-500 calories
        return tdee + 400;
      default: // maintain
        return tdee;
    }
  }

  // Calculate protein needs based on activity level and goals
  calculateProteinNeeds(
    weightKg: number,
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
    goal: 'lose' | 'maintain' | 'gain'
  ): number {
    let proteinPerKg: number;

    // Base protein needs
    if (goal === 'lose') {
      // Higher protein during deficit to preserve muscle
      switch(fitnessLevel) {
        case 'beginner': proteinPerKg = 1.6; break;
        case 'intermediate': proteinPerKg = 1.8; break;
        case 'advanced': proteinPerKg = 2.2; break;
      }
    } else if (goal === 'gain') {
      // Adequate protein for muscle building
      switch(fitnessLevel) {
        case 'beginner': proteinPerKg = 1.4; break;
        case 'intermediate': proteinPerKg = 1.6; break;
        case 'advanced': proteinPerKg = 1.8; break;
      }
    } else {
      // Maintenance protein needs
      switch(fitnessLevel) {
        case 'beginner': proteinPerKg = 1.2; break;
        case 'intermediate': proteinPerKg = 1.4; break;
        case 'advanced': proteinPerKg = 1.6; break;
      }
    }

    return Math.round(weightKg * proteinPerKg);
  }

  // Create complete nutrition profile
  createNutritionProfile(
    userId: string,
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active',
    goal: 'lose' | 'maintain' | 'gain',
    dietaryRestrictions: string[] = [],
    allergies: string[] = []
  ): NutritionProfile {
    const tdee = this.calculateTDEE(weight, height, age, gender, activityLevel);
    const bmr = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    
    const targetCalories = this.calculateTargetCalories(tdee, goal);
    const macroGoals = this.calculateMacros(targetCalories, goal);

    return {
      userId,
      tdee,
      bmr: Math.round(bmr),
      goal,
      target_calories: targetCalories,
      macro_goals: macroGoals,
      dietary_restrictions: dietaryRestrictions,
      allergies,
      preferences: [],
      meal_timing: ['breakfast', 'lunch', 'dinner', 'snack']
    };
  }

  // Calculate meal distribution throughout the day
  distributeMealsCalories(totalCalories: number, mealCount: number = 4): { [meal: string]: number } {
    // Standard distribution: Breakfast 25%, Lunch 30%, Dinner 30%, Snacks 15%
    const distributions = {
      breakfast: 0.25,
      lunch: 0.30,
      dinner: 0.30,
      snack: 0.15
    };

    return {
      breakfast: Math.round(totalCalories * distributions.breakfast),
      lunch: Math.round(totalCalories * distributions.lunch),
      dinner: Math.round(totalCalories * distributions.dinner),
      snack: Math.round(totalCalories * distributions.snack)
    };
  }

  // Hydration calculator
  calculateWaterNeeds(weightKg: number, activityLevel: string): number {
    // Base water needs: 35ml per kg of body weight
    const baseWater = weightKg * 35; // ml

    // Add extra for activity
    const activityMultipliers = {
      'sedentary': 1.0,
      'light': 1.1,
      'moderate': 1.2,
      'active': 1.3,
      'very-active': 1.4
    };

    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.0;
    return Math.round(baseWater * multiplier);
  }

  // Validate nutrition goals are safe and realistic
  validateNutritionGoals(profile: NutritionProfile): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check if calories are too low
    if (profile.target_calories < 1200) {
      warnings.push('Calorie target may be too low for safe weight loss');
    }

    // Check if protein is adequate
    const proteinCalories = profile.macro_goals.protein * 4;
    const proteinPercent = (proteinCalories / profile.target_calories) * 100;
    
    if (proteinPercent < 15) {
      warnings.push('Protein intake may be insufficient for muscle maintenance');
    }

    // Check if fat intake is adequate
    const fatCalories = profile.macro_goals.fats * 9;
    const fatPercent = (fatCalories / profile.target_calories) * 100;
    
    if (fatPercent < 20) {
      warnings.push('Fat intake may be too low for hormone production and nutrient absorption');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// Singleton instance
export const nutritionService = new NutritionService();