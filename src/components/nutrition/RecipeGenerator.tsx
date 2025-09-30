// FitForge Recipe Generator - Production Ready
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFitForgeAI } from '@/hooks/useFitForgeAI';
import { useAuth } from '@/hooks/useAuth';
import { nutritionService } from '@/services/nutritionService';
import { useToast } from '@/hooks/use-toast';
import type { HealthyRecipe } from '@/types/nutrition';
import { 
  ChefHat, 
  Clock, 
  Users, 
  Zap,
  Apple,
  AlertCircle,
  Heart,
  Utensils,
  Star,
  CheckCircle
} from 'lucide-react';

export const RecipeGenerator = () => {
  const { user } = useAuth();
  const { generateRecipe, recipeLoading, recipeError } = useFitForgeAI();
  const { toast } = useToast();
  
  const [generatedRecipe, setGeneratedRecipe] = useState<HealthyRecipe | null>(null);
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    calorieTarget: 400,
    cookingTime: 30,
    dietaryRestrictions: [] as string[]
  });

  // Calculate nutrition profile for current user
  const nutritionProfile = user ? nutritionService.createNutritionProfile(
    user.id,
    70, // Default weight - would come from user profile
    175, // Default height - would come from user profile  
    user.age,
    user.gender === 'male' ? 'male' : 'female',
    'moderate', // Default activity level - would come from user profile
    'maintain' // Default goal - would come from user profile
  ) : null;

  const handleGenerateRecipe = async () => {
    if (!nutritionProfile) return;

    const recipe = await generateRecipe({
      calorieTarget: formData.calorieTarget,
      macroGoals: nutritionProfile.macro_goals,
      dietaryRestrictions: formData.dietaryRestrictions,
      cookingTime: formData.cookingTime,
      mealType: formData.mealType
    });

    if (recipe) {
      setGeneratedRecipe(recipe);
      toast({
        title: "Recipe Generated! 👨‍🍳",
        description: `Your healthy ${formData.mealType} recipe is ready`,
      });
    }
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];

  const commonRestrictions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
    'nut-free', 'low-carb', 'keto', 'paleo'
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-2">AI Recipe Generator</h1>
        <p className="text-muted-foreground">Create healthy recipes tailored to your nutrition goals</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recipe Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="fitness-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <span>Recipe Preferences</span>
              </CardTitle>
              <CardDescription>Customize your recipe requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meal Type */}
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={formData.mealType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, mealType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map(meal => (
                      <SelectItem key={meal.value} value={meal.value}>
                        <div className="flex items-center space-x-2">
                          <span>{meal.icon}</span>
                          <span>{meal.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calorie Target */}
              <div className="space-y-2">
                <Label>Calorie Target</Label>
                <Input
                  type="number"
                  value={formData.calorieTarget}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    calorieTarget: parseInt(e.target.value) || 0 
                  }))}
                  min="100"
                  max="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: {nutritionProfile ? Math.round(nutritionProfile.target_calories / 4) : 400} cal per meal
                </p>
              </div>

              {/* Cooking Time */}
              <div className="space-y-2">
                <Label>Maximum Cooking Time (minutes)</Label>
                <Select value={formData.cookingTime.toString()} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, cookingTime: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes (Quick)</SelectItem>
                    <SelectItem value="30">30 minutes (Standard)</SelectItem>
                    <SelectItem value="45">45 minutes (Elaborate)</SelectItem>
                    <SelectItem value="60">60 minutes (Gourmet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-3">
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonRestrictions.map(restriction => (
                    <Button
                      key={restriction}
                      variant={formData.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                      size="sm"
                      className="justify-start capitalize"
                      onClick={() => toggleRestriction(restriction)}
                    >
                      {formData.dietaryRestrictions.includes(restriction) && (
                        <CheckCircle className="h-3 w-3 mr-2" />
                      )}
                      {restriction}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateRecipe}
                disabled={recipeLoading}
                className="w-full bg-gradient-to-r from-nutrition to-nutrition/80 hover:from-nutrition/90 hover:to-nutrition/70"
              >
                {recipeLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generate Recipe
                  </>
                )}
              </Button>

              {/* Error Display */}
              {recipeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{recipeError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Recipe */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {generatedRecipe ? (
            <Card className="fitness-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-nutrition" />
                    <span>{generatedRecipe.recipe_name}</span>
                  </CardTitle>
                  <Badge className={getDifficultyColor(generatedRecipe.difficulty)}>
                    {generatedRecipe.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{generatedRecipe.prep_time_minutes + generatedRecipe.cook_time_minutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{generatedRecipe.servings} serving{generatedRecipe.servings > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    <span>{generatedRecipe.nutrition_summary.total_calories} cal</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Nutrition Summary */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3 text-sm">NUTRITION FACTS</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg text-primary">
                        {generatedRecipe.nutrition_summary.total_calories}
                      </div>
                      <div className="text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-strength">
                        {generatedRecipe.nutrition_summary.protein}g
                      </div>
                      <div className="text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-cardio">
                        {generatedRecipe.nutrition_summary.carbs}g
                      </div>
                      <div className="text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-accent">
                        {generatedRecipe.nutrition_summary.fats}g
                      </div>
                      <div className="text-muted-foreground">Fats</div>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">INGREDIENTS</h4>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-secondary" />
                          <span>
                            {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
                            {ingredient.optional && (
                              <span className="text-muted-foreground italic"> (optional)</span>
                            )}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {ingredient.calories} cal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Instructions */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">INSTRUCTIONS</h4>
                  <ol className="space-y-3">
                    {generatedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex space-x-3 text-sm">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Health Benefits */}
                {generatedRecipe.health_benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-sm flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-secondary" />
                      <span>HEALTH BENEFITS</span>
                    </h4>
                    <ul className="text-sm space-y-1">
                      {generatedRecipe.health_benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Star className="h-3 w-3 text-secondary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meal Prep Tips */}
                {generatedRecipe.meal_prep_tips.length > 0 && (
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm text-secondary">MEAL PREP TIPS</h4>
                    <ul className="text-sm space-y-1">
                      {generatedRecipe.meal_prep_tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    <Apple className="h-4 w-4 mr-2" />
                    Add to Meal Plan
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-secondary to-accent">
                    <Heart className="h-4 w-4 mr-2" />
                    Save Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="fitness-card">
              <CardContent className="text-center py-16">
                <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                  <ChefHat className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Recipe Generated Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your preferences and generate a healthy recipe
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};