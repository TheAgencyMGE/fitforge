// FitForge Nutrition Types
export interface MacroGoals {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface NutritionProfile {
  userId: string;
  tdee: number;
  bmr: number;
  goal: 'lose' | 'maintain' | 'gain';
  target_calories: number;
  macro_goals: MacroGoals;
  dietary_restrictions: string[];
  allergies: string[];
  preferences: string[];
  meal_timing: string[];
}

export interface HealthyRecipe {
  id: string;
  recipe_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition_summary: NutritionSummary;
  meal_prep_tips: string[];
  health_benefits: string[];
  variations: string[];
  dietary_tags: string[];
  cost_estimate: 'low' | 'medium' | 'high';
}

export interface RecipeIngredient {
  ingredient: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  optional: boolean;
}

export interface NutritionSummary {
  total_calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins: { [key: string]: number };
  minerals: { [key: string]: number };
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  serving_size: string;
  nutrition_per_serving: NutritionSummary;
  barcode?: string;
  category: string;
  verified: boolean;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: Date;
  meals: MealEntry[];
  water_intake_ml: number;
  daily_totals: NutritionSummary;
  goal_progress: {
    calories_percentage: number;
    protein_percentage: number;
    carbs_percentage: number;
    fats_percentage: number;
  };
}

export interface MealEntry {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: FoodEntry[];
  meal_calories: number;
  meal_macros: MacroGoals;
}

export interface FoodEntry {
  food_id: string;
  name: string;
  serving_size: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  week_start: Date;
  target_calories: number;
  target_macros: MacroGoals;
  daily_meals: { [date: string]: DailyMealPlan };
  shopping_list: ShoppingListItem[];
  prep_instructions: string[];
  estimated_cost: number;
}

export interface DailyMealPlan {
  date: Date;
  breakfast: HealthyRecipe;
  lunch: HealthyRecipe;
  dinner: HealthyRecipe;
  snacks: HealthyRecipe[];
  daily_calories: number;
  daily_macros: MacroGoals;
}

export interface ShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  estimated_cost: number;
  found: boolean;
}