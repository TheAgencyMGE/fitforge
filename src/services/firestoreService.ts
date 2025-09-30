import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  UserProfile,
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

export class FirestoreService {
  async createUserProfile(userId: string, profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', userId), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }
    return null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async saveWorkoutPlan(userId: string, workoutPlan: Omit<WorkoutPlan, 'id'>): Promise<string> {
    try {
      const docData = {
        ...workoutPlan,
        userId,
        created_at: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'workoutPlans'), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw error;
    }
  }

  async getUserWorkoutPlans(userId: string, limitCount: number = 10): Promise<WorkoutPlan[]> {
    const q = query(
      collection(db, 'workoutPlans'),
      where('userId', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date()
    })) as WorkoutPlan[];
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
    const planDoc = await getDoc(doc(db, 'workoutPlans', planId));
    if (planDoc.exists()) {
      const data = planDoc.data();
      return {
        id: planId,
        ...data,
        created_at: data.created_at?.toDate() || new Date()
      } as WorkoutPlan;
    }
    return null;
  }

  async saveWorkoutSession(userId: string, session: Omit<WorkoutSession, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'workoutSessions'), {
      ...session,
      userId,
      date: Timestamp.fromDate(session.date),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getUserWorkoutSessions(userId: string, limitCount: number = 50): Promise<WorkoutSession[]> {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date()
    })) as WorkoutSession[];
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    updateData.updatedAt = serverTimestamp();

    await updateDoc(doc(db, 'workoutSessions', sessionId), updateData);
  }

  async saveProgressMetrics(userId: string, metrics: Omit<ProgressMetrics, 'userId'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'progressMetrics'), {
      ...metrics,
      userId,
      date: Timestamp.fromDate(metrics.date),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getUserProgressMetrics(userId: string, limitCount: number = 50): Promise<ProgressMetrics[]> {
    const q = query(
      collection(db, 'progressMetrics'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        userId,
        date: data.date?.toDate() || new Date()
      };
    }) as ProgressMetrics[];
  }

  async getLatestProgressMetrics(userId: string): Promise<ProgressMetrics | null> {
    const q = query(
      collection(db, 'progressMetrics'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        userId,
        date: data.date?.toDate() || new Date()
      } as ProgressMetrics;
    }
    return null;
  }

  async saveNutritionProfile(userId: string, profile: NutritionProfile): Promise<void> {
    await setDoc(doc(db, 'nutritionProfiles', userId), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getNutritionProfile(userId: string): Promise<NutritionProfile | null> {
    const profileDoc = await getDoc(doc(db, 'nutritionProfiles', userId));
    if (profileDoc.exists()) {
      return { ...profileDoc.data() } as NutritionProfile;
    }
    return null;
  }

  async updateNutritionProfile(userId: string, updates: Partial<NutritionProfile>): Promise<void> {
    await updateDoc(doc(db, 'nutritionProfiles', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async saveRecipe(recipe: Omit<HealthyRecipe, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipe,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getRecipes(mealType?: string, limitCount: number = 20): Promise<HealthyRecipe[]> {
    let q = query(collection(db, 'recipes'), limit(limitCount));

    if (mealType) {
      q = query(
        collection(db, 'recipes'),
        where('meal_type', '==', mealType),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthyRecipe[];
  }

  async saveNutritionLog(userId: string, log: Omit<NutritionLog, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'nutritionLogs'), {
      ...log,
      userId,
      date: Timestamp.fromDate(log.date),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getUserNutritionLogs(userId: string, limitCount: number = 30): Promise<NutritionLog[]> {
    const q = query(
      collection(db, 'nutritionLogs'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date()
    })) as NutritionLog[];
  }

  async saveMealPlan(userId: string, mealPlan: Omit<MealPlan, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'mealPlans'), {
      ...mealPlan,
      userId,
      week_start: Timestamp.fromDate(mealPlan.week_start),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getUserMealPlans(userId: string, limitCount: number = 10): Promise<MealPlan[]> {
    const q = query(
      collection(db, 'mealPlans'),
      where('userId', '==', userId),
      orderBy('week_start', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      week_start: doc.data().week_start?.toDate() || new Date()
    })) as MealPlan[];
  }

  async getUserDashboardStats(userId: string): Promise<{
    workoutStreak: number;
    totalWorkouts: number;
    caloriesBurned: number;
    weeklyGoalProgress: number;
    recentWeight?: number;
  }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [allSessions, recentSessions, progressMetrics] = await Promise.all([
      this.getUserWorkoutSessions(userId, 100),
      getDocs(query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(oneMonthAgo)),
        orderBy('date', 'desc')
      )),
      this.getLatestProgressMetrics(userId)
    ]);

    const totalWorkouts = allSessions.length;
    const caloriesBurned = recentSessions.docs.reduce((total, doc) => {
      return total + (doc.data().calories_burned || 0);
    }, 0);

    let workoutStreak = 0;
    const sortedSessions = allSessions.sort((a, b) => b.date.getTime() - a.date.getTime());
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === checkDate.getTime()) {
        workoutStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sessionDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    const weeklyGoal = 4; // Default weekly workout goal
    const thisWeekSessions = recentSessions.docs.filter(doc => {
      const sessionDate = doc.data().date?.toDate() || new Date();
      return sessionDate >= oneWeekAgo;
    }).length;
    const weeklyGoalProgress = Math.min((thisWeekSessions / weeklyGoal) * 100, 100);

    return {
      workoutStreak,
      totalWorkouts,
      caloriesBurned,
      weeklyGoalProgress,
      recentWeight: progressMetrics?.weight
    };
  }

  async saveExercise(exercise: Omit<Exercise, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'exercises'), {
      ...exercise,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getExercises(category?: string, equipment?: string[], limitCount: number = 50): Promise<Exercise[]> {
    let q = query(collection(db, 'exercises'), limit(limitCount));

    if (category) {
      q = query(
        collection(db, 'exercises'),
        where('category', '==', category),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    let exercises = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exercise[];

    if (equipment && equipment.length > 0) {
      exercises = exercises.filter(exercise =>
        exercise.equipment.some(eq => equipment.includes(eq))
      );
    }

    return exercises;
  }

  async saveUserAchievement(userId: string, achievement: {
    title: string;
    description: string;
    type: string;
    earnedAt: Date;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, 'achievements'), {
      ...achievement,
      userId,
      earnedAt: Timestamp.fromDate(achievement.earnedAt),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getUserAchievements(userId: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    earnedAt: Date;
    metadata?: Record<string, unknown>;
  }>> {
    const q = query(
      collection(db, 'achievements'),
      where('userId', '==', userId),
      orderBy('earnedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      earnedAt: doc.data().earnedAt?.toDate() || new Date()
    }));
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, docId));
  }

  async createInitialData(userId: string): Promise<void> {
    const sampleExercises = [
      {
        name: 'Push-ups',
        category: 'strength' as const,
        muscle_groups: ['chest', 'triceps', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'beginner' as const,
        instructions: [
          'Start in a plank position with hands shoulder-width apart',
          'Lower your body until your chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your core tight throughout the movement'
        ],
        form_cues: ['Keep your back straight', 'Don\'t let your hips sag'],
        modifications: ['Knee push-ups for beginners', 'Incline push-ups'],
        safety_notes: ['Stop if you feel pain in your wrists or shoulders']
      },
      {
        name: 'Squats',
        category: 'strength' as const,
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        difficulty: 'beginner' as const,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting in a chair',
          'Keep your chest up and knees behind toes',
          'Return to starting position'
        ],
        form_cues: ['Keep your weight on your heels', 'Don\'t let knees cave inward'],
        modifications: ['Box squats', 'Assisted squats'],
        safety_notes: ['Don\'t squat too deep if you have knee issues']
      }
    ];

    for (const exercise of sampleExercises) {
      try {
        await this.saveExercise(exercise);
      } catch (error) {
        console.log('Exercise already exists or error creating:', exercise.name);
      }
    }

    const sampleRecipes = [
      {
        recipe_name: 'Protein Power Bowl',
        meal_type: 'lunch' as const,
        servings: 1,
        prep_time_minutes: 15,
        cook_time_minutes: 0,
        difficulty: 'easy' as const,
        ingredients: [
          {
            ingredient: 'Quinoa (cooked)',
            amount: '1',
            unit: 'cup',
            calories: 220,
            protein: 8,
            carbs: 39,
            fats: 4,
            fiber: 5,
            optional: false
          },
          {
            ingredient: 'Grilled Chicken Breast',
            amount: '4',
            unit: 'oz',
            calories: 185,
            protein: 35,
            carbs: 0,
            fats: 4,
            fiber: 0,
            optional: false
          }
        ],
        instructions: [
          'Prepare quinoa according to package instructions',
          'Grill chicken breast until cooked through',
          'Combine in bowl with fresh vegetables',
          'Drizzle with olive oil and lemon'
        ],
        nutrition_summary: {
          total_calories: 405,
          protein: 43,
          carbs: 39,
          fats: 8,
          fiber: 5,
          sugar: 2,
          sodium: 120,
          vitamins: { 'Vitamin C': 25, 'Vitamin A': 15 },
          minerals: { 'Iron': 12, 'Calcium': 8 }
        },
        meal_prep_tips: ['Can be made ahead and refrigerated for 3 days'],
        health_benefits: ['High protein for muscle building', 'Complex carbs for energy'],
        variations: ['Swap chicken for tofu', 'Add avocado for healthy fats'],
        dietary_tags: ['high-protein', 'gluten-free'],
        cost_estimate: 'medium' as const
      }
    ];

    for (const recipe of sampleRecipes) {
      try {
        await this.saveRecipe(recipe);
      } catch (error) {
        console.log('Recipe already exists or error creating:', recipe.recipe_name);
      }
    }
  }
}

export const firestoreService = new FirestoreService();