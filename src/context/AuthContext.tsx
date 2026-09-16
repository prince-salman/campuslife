import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, UserRole, DEMO_ADMIN, DEMO_STUDENT } from '../services/authService';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = '@campuslife_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1. Check AsyncStorage for fast restore
        const cached = await AsyncStorage.getItem(LOCAL_USER_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
        }

        // 2. Check Supabase auth state
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const profile = await authService.fetchProfile(
            data.session.user.id,
            data.session.user.email || ''
          );
          setUser(profile);
          await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        }
      } catch (err) {
        console.warn('Session restore error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        // Only clear if not in demo mode
        if (user && !user.id.startsWith('admin_demo') && !user.id.startsWith('student_demo')) {
          setUser(null);
          await AsyncStorage.removeItem(LOCAL_USER_KEY);
        }
      } else if (session.user) {
        const profile = await authService.fetchProfile(
          session.user.id,
          session.user.email || ''
        );
        setUser(profile);
        await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    try {
      const profile = await authService.login(email, pass);
      setUser(profile);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, fullName: string): Promise<void> => {
    setIsLoading(true);
    try {
      const profile = await authService.register(email, pass, fullName);
      setUser(profile);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (targetRole: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const targetUser = targetRole === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
      setUser(targetUser);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(targetUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      await AsyncStorage.removeItem(LOCAL_USER_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
