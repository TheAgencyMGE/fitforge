import { useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type AuthResponse, type SignupData } from '@/services/authService';
import type { UserProfile } from '@/types/fitness';

export interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (userData: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResponse>;
  getDemoAccounts: () => { id: string; email: string; name: string; fitnessLevel: string }[];
  createDemoAccounts: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      console.log('Initializing auth with user:', currentUser);
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();

    const handleAuthChange = () => {
      console.log('Custom auth change event detected');
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        console.log('Auth change handler - setting user:', currentUser);
        setUser(currentUser);
        setIsLoading(false);
      }, 100); // Small delay to ensure auth service is updated
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      if (response.success && response.user) {
        console.log('Setting user state immediately:', response.user);
        setUser(response.user);
      }
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (userData: SignupData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.signup(userData);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(updates);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDemoAccounts = useCallback(() => {
    return authService.getDemoAccounts();
  }, []);

  const createDemoAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.createDemoAccounts();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Auth state changed - User:', user, 'IsAuthenticated:', !!user);
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    getDemoAccounts,
    createDemoAccounts
  };
};