// FitForge AI Hook - Production Ready
import { useState, useCallback } from 'react';
import { fitForgeAI } from '@/services/fitForgeAI';
import type { WeeklySchedule, ProgressMetrics, AdaptationRecommendations, WorkoutSession } from '@/types/fitness';
import type { HealthyRecipe, MacroGoals } from '@/types/nutrition';

export interface UseFitForgeAIReturn {
  // Workout Generation
  generateWorkout: (params: WorkoutGenerationParams) => Promise<WeeklySchedule | null>;
  workoutLoading: boolean;
  workoutError: string | null;
  
  // Recipe Generation
  generateRecipe: (params: RecipeGenerationParams) => Promise<HealthyRecipe | null>;
  recipeLoading: boolean;
  recipeError: string | null;
  
  // Progress Analysis
  analyzeProgress: (params: ProgressAnalysisParams) => Promise<AdaptationRecommendations | null>;
  analysisLoading: boolean;
  analysisError: string | null;
  
  // Motivation
  generateMotivation: (params: MotivationParams) => Promise<string | null>;
  motivationLoading: boolean;
  motivationError: string | null;
}

export interface WorkoutGenerationParams {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableDays: number;
  equipment: string[];
  limitations: string[];
}

export interface RecipeGenerationParams {
  calorieTarget: number;
  macroGoals: MacroGoals;
  dietaryRestrictions: string[];
  cookingTime: number;
  mealType: string;
}

export interface ProgressAnalysisParams {
  workoutHistory: WorkoutSession[];
  progressMetrics: ProgressMetrics;
  userFeedback: string;
}

export interface MotivationParams {
  userName: string;
  currentStreak: number;
  recentProgress: string;
  mood: number;
}

export const useFitForgeAI = (): UseFitForgeAIReturn => {
  // Workout generation state
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  
  // Recipe generation state
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  
  // Progress analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Motivation state
  const [motivationLoading, setMotivationLoading] = useState(false);
  const [motivationError, setMotivationError] = useState<string | null>(null);

  // Generate workout schedule
  const generateWorkout = useCallback(async (params: WorkoutGenerationParams): Promise<WeeklySchedule | null> => {
    setWorkoutLoading(true);
    setWorkoutError(null);
    
    try {
      const schedule = await fitForgeAI.generateWorkoutSchedule(
        params.fitnessLevel,
        params.goals,
        params.availableDays,
        params.equipment,
        params.limitations
      );
      
      return schedule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate workout';
      setWorkoutError(errorMessage);
      return null;
    } finally {
      setWorkoutLoading(false);
    }
  }, []);

  // Generate healthy recipe
  const generateRecipe = useCallback(async (params: RecipeGenerationParams): Promise<HealthyRecipe | null> => {
    setRecipeLoading(true);
    setRecipeError(null);
    
    try {
      const recipe = await fitForgeAI.generateHealthyRecipe(
        params.calorieTarget,
        params.macroGoals,
        params.dietaryRestrictions,
        params.cookingTime,
        params.mealType
      );
      
      return recipe;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recipe';
      setRecipeError(errorMessage);
      return null;
    } finally {
      setRecipeLoading(false);
    }
  }, []);

  // Analyze progress and get recommendations
  const analyzeProgress = useCallback(async (params: ProgressAnalysisParams): Promise<AdaptationRecommendations | null> => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const analysis = await fitForgeAI.analyzeProgressAndAdapt(
        params.workoutHistory,
        params.progressMetrics,
        params.userFeedback
      );
      
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze progress';
      setAnalysisError(errorMessage);
      return null;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  // Generate motivational message
  const generateMotivation = useCallback(async (params: MotivationParams): Promise<string | null> => {
    setMotivationLoading(true);
    setMotivationError(null);
    
    try {
      const message = await fitForgeAI.generateMotivationalMessage(
        params.userName,
        params.currentStreak,
        params.recentProgress,
        params.mood
      );
      
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate motivation';
      setMotivationError(errorMessage);
      return null;
    } finally {
      setMotivationLoading(false);
    }
  }, []);

  return {
    generateWorkout,
    workoutLoading,
    workoutError,
    generateRecipe,
    recipeLoading,
    recipeError,
    analyzeProgress,
    analysisLoading,
    analysisError,
    generateMotivation,
    motivationLoading,
    motivationError
  };
};