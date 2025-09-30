import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '@/services/firestoreService';
import { useAuth } from '@/hooks/useAuth';
import type {
  WorkoutPlan,
  WorkoutSession,
  ProgressMetrics,
  Exercise,
  WeeklySchedule
} from '@/types/fitness';
import type {
  NutritionProfile,
  HealthyRecipe,
  NutritionLog,
  MealPlan
} from '@/types/nutrition';

export interface DashboardStats {
  workoutStreak: number;
  totalWorkouts: number;
  caloriesBurned: number;
  weeklyGoalProgress: number;
  recentWeight?: number;
}

export const useWorkoutPlans = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutPlans = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const plans = await firestoreService.getUserWorkoutPlans(user.id);
      setWorkoutPlans(plans);
    } catch (err) {
      setError('Failed to fetch workout plans');
      console.error('Error fetching workout plans:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveWorkoutPlan = useCallback(async (plan: Omit<WorkoutPlan, 'id' | 'userId'>) => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const planId = await firestoreService.saveWorkoutPlan(user.id, plan);
      await fetchWorkoutPlans(); // Refresh the list
      return planId;
    } catch (err) {
      setError('Failed to save workout plan');
      console.error('Error saving workout plan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchWorkoutPlans]);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  return {
    workoutPlans,
    loading,
    error,
    saveWorkoutPlan,
    refetch: fetchWorkoutPlans
  };
};

export const useWorkoutSessions = () => {
  const { user } = useAuth();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutSessions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const sessions = await firestoreService.getUserWorkoutSessions(user.id);
      setWorkoutSessions(sessions);
    } catch (err) {
      setError('Failed to fetch workout sessions');
      console.error('Error fetching workout sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveWorkoutSession = useCallback(async (session: Omit<WorkoutSession, 'id' | 'userId'>) => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const sessionId = await firestoreService.saveWorkoutSession(user.id, session);
      await fetchWorkoutSessions(); // Refresh the list
      return sessionId;
    } catch (err) {
      setError('Failed to save workout session');
      console.error('Error saving workout session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchWorkoutSessions]);

  const updateWorkoutSession = useCallback(async (sessionId: string, updates: Partial<WorkoutSession>) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreService.updateWorkoutSession(sessionId, updates);
      await fetchWorkoutSessions(); // Refresh the list
    } catch (err) {
      setError('Failed to update workout session');
      console.error('Error updating workout session:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWorkoutSessions]);

  useEffect(() => {
    fetchWorkoutSessions();
  }, [fetchWorkoutSessions]);

  return {
    workoutSessions,
    loading,
    error,
    saveWorkoutSession,
    updateWorkoutSession,
    refetch: fetchWorkoutSessions
  };
};

export const useProgressMetrics = () => {
  const { user } = useAuth();
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressMetrics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const [metrics, latest] = await Promise.all([
        firestoreService.getUserProgressMetrics(user.id),
        firestoreService.getLatestProgressMetrics(user.id)
      ]);
      setProgressMetrics(metrics);
      setLatestMetrics(latest);
    } catch (err) {
      setError('Failed to fetch progress metrics');
      console.error('Error fetching progress metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveProgressMetrics = useCallback(async (metrics: Omit<ProgressMetrics, 'userId'>) => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const metricsId = await firestoreService.saveProgressMetrics(user.id, metrics);
      await fetchProgressMetrics(); // Refresh the list
      return metricsId;
    } catch (err) {
      setError('Failed to save progress metrics');
      console.error('Error saving progress metrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchProgressMetrics]);

  useEffect(() => {
    fetchProgressMetrics();
  }, [fetchProgressMetrics]);

  return {
    progressMetrics,
    latestMetrics,
    loading,
    error,
    saveProgressMetrics,
    refetch: fetchProgressMetrics
  };
};

export const useNutritionProfile = () => {
  const { user } = useAuth();
  const [nutritionProfile, setNutritionProfile] = useState<NutritionProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const profile = await firestoreService.getNutritionProfile(user.id);
      setNutritionProfile(profile);
    } catch (err) {
      setError('Failed to fetch nutrition profile');
      console.error('Error fetching nutrition profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveNutritionProfile = useCallback(async (profile: NutritionProfile) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      await firestoreService.saveNutritionProfile(user.id, profile);
      setNutritionProfile(profile);
    } catch (err) {
      setError('Failed to save nutrition profile');
      console.error('Error saving nutrition profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateNutritionProfile = useCallback(async (updates: Partial<NutritionProfile>) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      await firestoreService.updateNutritionProfile(user.id, updates);
      setNutritionProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError('Failed to update nutrition profile');
      console.error('Error updating nutrition profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNutritionProfile();
  }, [fetchNutritionProfile]);

  return {
    nutritionProfile,
    loading,
    error,
    saveNutritionProfile,
    updateNutritionProfile,
    refetch: fetchNutritionProfile
  };
};

export const useRecipes = (mealType?: string) => {
  const [recipes, setRecipes] = useState<HealthyRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await firestoreService.getRecipes(mealType);
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [mealType]);

  const saveRecipe = useCallback(async (recipe: Omit<HealthyRecipe, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const recipeId = await firestoreService.saveRecipe(recipe);
      await fetchRecipes(); // Refresh the list
      return recipeId;
    } catch (err) {
      setError('Failed to save recipe');
      console.error('Error saving recipe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    saveRecipe,
    refetch: fetchRecipes
  };
};

export const useNutritionLogs = () => {
  const { user } = useAuth();
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionLogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const logs = await firestoreService.getUserNutritionLogs(user.id);
      setNutritionLogs(logs);
    } catch (err) {
      setError('Failed to fetch nutrition logs');
      console.error('Error fetching nutrition logs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveNutritionLog = useCallback(async (log: Omit<NutritionLog, 'id' | 'userId'>) => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const logId = await firestoreService.saveNutritionLog(user.id, log);
      await fetchNutritionLogs(); // Refresh the list
      return logId;
    } catch (err) {
      setError('Failed to save nutrition log');
      console.error('Error saving nutrition log:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchNutritionLogs]);

  useEffect(() => {
    fetchNutritionLogs();
  }, [fetchNutritionLogs]);

  return {
    nutritionLogs,
    loading,
    error,
    saveNutritionLog,
    refetch: fetchNutritionLogs
  };
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    workoutStreak: 0,
    totalWorkouts: 0,
    caloriesBurned: 0,
    weeklyGoalProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const dashboardStats = await firestoreService.getUserDashboardStats(user.id);
      setStats(dashboardStats);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};

export const useExercises = (category?: string, equipment?: string[]) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedExercises = await firestoreService.getExercises(category, equipment);
      setExercises(fetchedExercises);
    } catch (err) {
      setError('Failed to fetch exercises');
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  }, [category, equipment]);

  const saveExercise = useCallback(async (exercise: Omit<Exercise, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const exerciseId = await firestoreService.saveExercise(exercise);
      await fetchExercises(); // Refresh the list
      return exerciseId;
    } catch (err) {
      setError('Failed to save exercise');
      console.error('Error saving exercise:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchExercises]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    loading,
    error,
    saveExercise,
    refetch: fetchExercises
  };
};

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    earnedAt: Date;
    metadata?: Record<string, unknown>;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const userAchievements = await firestoreService.getUserAchievements(user.id);
      setAchievements(userAchievements);
    } catch (err) {
      setError('Failed to fetch achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveAchievement = useCallback(async (achievement: {
    title: string;
    description: string;
    type: string;
    earnedAt: Date;
    metadata?: Record<string, unknown>;
  }) => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const achievementId = await firestoreService.saveUserAchievement(user.id, achievement);
      await fetchAchievements(); // Refresh the list
      return achievementId;
    } catch (err) {
      setError('Failed to save achievement');
      console.error('Error saving achievement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAchievements]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    saveAchievement,
    refetch: fetchAchievements
  };
};