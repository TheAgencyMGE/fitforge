// FitForge Accountability Types
export interface AccountabilityData {
  userId: string;
  workout_streak: number;
  longest_streak: number;
  total_workouts: number;
  weekly_consistency: number; // percentage
  monthly_consistency: number; // percentage
  last_workout: Date;
  current_habits: Habit[];
  reminders: Reminder[];
  achievements: Achievement[];
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'exercise' | 'nutrition' | 'sleep' | 'hydration' | 'mindfulness';
  target_frequency: 'daily' | 'weekly' | 'custom';
  target_count: number;
  current_streak: number;
  completion_history: HabitCompletion[];
  created_at: Date;
  active: boolean;
}

export interface HabitCompletion {
  date: Date;
  completed: boolean;
  notes?: string;
  mood_before: number; // 1-10
  mood_after: number; // 1-10
}

export interface Reminder {
  id: string;
  userId: string;
  type: 'workout' | 'meal' | 'hydration' | 'sleep' | 'measurement';
  title: string;
  message: string;
  scheduled_time: string; // HH:MM format
  days_of_week: number[]; // 0-6, Sunday=0
  active: boolean;
  created_at: Date;
  last_sent?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'strength' | 'endurance' | 'nutrition' | 'milestone';
  icon: string;
  earned_at: Date;
  progress_value: number;
  target_value: number;
  badge_color: string;
  celebration_message: string;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: Date;
  energy_level: number; // 1-10
  mood_score: number; // 1-10
  motivation_level: number; // 1-10
  sleep_quality: number; // 1-10
  stress_level: number; // 1-10
  soreness_level: number; // 1-10
  hydration_glasses: number;
  notes: string;
  completed_habits: string[];
  workout_planned: boolean;
  workout_completed: boolean;
}

export interface MotivationMessage {
  id: string;
  message: string;
  category: 'encouragement' | 'progress' | 'consistency' | 'milestone' | 'struggle';
  triggers: string[];
  personalization_tags: string[];
  created_at: Date;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_type: 'workout' | 'nutrition' | 'habit';
  last_activity: Date;
  streak_history: StreakEntry[];
  milestones: StreakMilestone[];
}

export interface StreakEntry {
  date: Date;
  completed: boolean;
  activity_type: string;
  notes?: string;
}

export interface StreakMilestone {
  days: number;
  title: string;
  reward_message: string;
  achieved: boolean;
  achieved_at?: Date;
}

export interface SupportSystem {
  userId: string;
  workout_buddy?: {
    buddy_id: string;
    name: string;
    shared_goals: string[];
    accountability_level: 'light' | 'moderate' | 'intensive';
    check_in_frequency: 'daily' | 'weekly' | 'bi-weekly';
  };
  support_preferences: {
    reminder_style: 'gentle' | 'motivational' | 'firm';
    celebration_level: 'minimal' | 'moderate' | 'enthusiastic';
    progress_sharing: boolean;
    community_participation: boolean;
  };
  emergency_support: {
    enabled: boolean;
    contact_method: 'app' | 'email' | 'sms';
    trigger_days: number; // days of inactivity before triggered
  };
}