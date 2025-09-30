import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types/fitness';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

class FirebaseAuthService {
  private currentUser: UserProfile | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    this.unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        this.currentUser = userProfile;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChange'));
        }
      } else {
        this.currentUser = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChange'));
        }
      }
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const userProfile = await this.getUserProfile(userCredential.user.uid);
      if (!userProfile) {
        return { success: false, error: 'User profile not found' };
      }

      this.currentUser = userProfile;
      return { success: true, user: userProfile };
    } catch (error: unknown) {
      console.error('Login error:', error);
      return {
        success: false,
        error: this.getErrorMessage((error as { code?: string }).code || 'unknown')
      };
    }
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );

      await updateProfile(userCredential.user, {
        displayName: signupData.name
      });

      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        email: signupData.email,
        name: signupData.name,
        age: signupData.age || 25,
        gender: signupData.gender || 'other',
        fitnessLevel: signupData.fitnessLevel || 'beginner',
        goals: [],
        equipment: [],
        limitations: [],
        preferences: {
          workoutDays: [1, 3, 5],
          reminderTimes: ['07:00'],
          measurementSystem: 'metric'
        },
        createdAt: new Date(),
        onboardingCompleted: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp()
      });

      this.currentUser = userProfile;
      return { success: true, user: userProfile };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: this.getErrorMessage((error as { code?: string }).code || 'unknown')
      };
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: uid,
          createdAt: data.createdAt?.toDate() || new Date()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && auth.currentUser !== null;
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<AuthResponse> {
    try {
      if (!this.currentUser || !auth.currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const updatedProfile = { ...this.currentUser, ...updates };

      await updateDoc(doc(db, 'users', this.currentUser.id), updates);

      if (updates.name && updates.name !== this.currentUser.name) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }

      this.currentUser = updatedProfile;
      return { success: true, user: updatedProfile };
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  getDemoAccounts() {
    return [
      {
        id: '1',
        email: 'beginner@fitforge.com',
        name: 'Alex Beginner',
        fitnessLevel: 'beginner'
      },
      {
        id: '2',
        email: 'intermediate@fitforge.com',
        name: 'Sam Intermediate',
        fitnessLevel: 'intermediate'
      },
      {
        id: '3',
        email: 'advanced@fitforge.com',
        name: 'Jordan Advanced',
        fitnessLevel: 'advanced'
      }
    ];
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  async createDemoAccounts(): Promise<void> {
    const demoAccounts = [
      {
        email: 'beginner@fitforge.com',
        password: 'demo123',
        name: 'Alex Beginner',
        age: 28,
        gender: 'male' as const,
        fitnessLevel: 'beginner' as const,
        goals: ['lose weight', 'build strength', 'improve endurance'],
        equipment: ['bodyweight', 'resistance bands'],
        limitations: [],
        preferences: {
          workoutDays: [1, 3, 5],
          reminderTimes: ['07:00', '18:00'],
          measurementSystem: 'metric' as const
        },
        onboardingCompleted: true
      },
      {
        email: 'intermediate@fitforge.com',
        password: 'demo123',
        name: 'Sam Intermediate',
        age: 32,
        gender: 'female' as const,
        fitnessLevel: 'intermediate' as const,
        goals: ['build muscle', 'improve strength', 'better nutrition'],
        equipment: ['dumbbells', 'resistance bands', 'pull-up bar'],
        limitations: ['lower back issues'],
        preferences: {
          workoutDays: [1, 2, 4, 6],
          reminderTimes: ['06:30', '17:30'],
          measurementSystem: 'imperial' as const
        },
        onboardingCompleted: true
      },
      {
        email: 'advanced@fitforge.com',
        password: 'demo123',
        name: 'Jordan Advanced',
        age: 25,
        gender: 'other' as const,
        fitnessLevel: 'advanced' as const,
        goals: ['athletic performance', 'muscle building', 'competition prep'],
        equipment: ['full gym access', 'barbells', 'olympic weights'],
        limitations: [],
        preferences: {
          workoutDays: [1, 2, 3, 4, 5, 6],
          reminderTimes: ['05:30', '19:00'],
          measurementSystem: 'metric' as const
        },
        onboardingCompleted: true
      }
    ];

    for (const account of demoAccounts) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );

        await updateProfile(userCredential.user, {
          displayName: account.name
        });

        const userProfile: UserProfile = {
          id: userCredential.user.uid,
          email: account.email,
          name: account.name,
          age: account.age,
          gender: account.gender,
          fitnessLevel: account.fitnessLevel,
          goals: account.goals,
          equipment: account.equipment,
          limitations: account.limitations,
          preferences: account.preferences,
          createdAt: new Date(),
          onboardingCompleted: account.onboardingCompleted
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userProfile,
          createdAt: serverTimestamp()
        });

        console.log(`Demo account created: ${account.email}`);
      } catch (error: unknown) {
        if ((error as { code?: string }).code !== 'auth/email-already-in-use') {
          console.error(`Error creating demo account ${account.email}:`, error);
        }
      }
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export const authService = new FirebaseAuthService();