// FitForge Fitness Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  equipment: string[];
  limitations: string[];
  preferences: {
    workoutDays: number[];
    reminderTimes: string[];
    measurementSystem: 'metric' | 'imperial';
  };
  createdAt: Date;
  onboardingCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'recovery';
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  form_cues: string[];
  modifications: string[];
  safety_notes: string[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration_weeks: number;
  workouts_per_week: number;
  target_goals: string[];
  created_at: Date;
  weekly_schedule: WeeklySchedule;
}

export interface WeeklySchedule {
  [day: string]: WorkoutDay;
}

export interface WorkoutDay {
  day: string;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'rest' | 'active_recovery';
  exercises: WorkoutExercise[];
  duration_minutes: number;
  warmup: string[];
  cooldown: string[];
  notes: string;
}

export interface WorkoutExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  duration?: number;
  rest_time: string;
  form_cues: string[];
  modifications: string[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workout_plan_id: string;
  date: Date;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'recovery';
  exercises: CompletedExercise[];
  duration_minutes: number;
  calories_burned: number;
  energy_level: number; // 1-10 scale
  mood_score: number; // 1-10 scale
  notes: string;
  completed: boolean;
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  sets_completed: number;
  reps_completed: number[];
  weight_used: number[];
  duration_seconds?: number;
  notes: string;
  form_rating: number; // 1-10 scale
}

export interface ProgressMetrics {
  userId: string;
  date: Date;
  weight?: number;
  body_fat_percentage?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  strength_metrics: {
    [exercise: string]: {
      max_weight: number;
      max_reps: number;
      volume: number;
    };
  };
  cardio_metrics: {
    max_distance?: number;
    best_time?: number;
    avg_heart_rate?: number;
  };
  energy_level: number;
  sleep_hours: number;
  stress_level: number;
  motivation_level: number;
}

export interface AdaptationRecommendations {
  progress_assessment: {
    strength_gains: string;
    consistency: string;
    recovery_quality: string;
    potential_issues: string[];
  };
  adaptations: Array<{
    area: string;
    current_approach: string;
    recommendation: string;
    reasoning: string;
    implementation_tips: string[];
  }>;
  motivational_insights: string[];
  warning_signs_detected: string[];
  celebrate_wins: string[];
  next_milestones: Array<{
    goal: string;
    timeline: string;
    steps: string[];
  }>;
}