import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, UserRole, DEMO_ADMIN, DEMO_CLASS_MANAGER, DEMO_STUDENT } from '../services/authService';
import { supabase } from '../services/supabase';
import { walletService } from '../services/walletService';
import { scheduleService } from '../services/scheduleService';
import { assignmentService } from '../services/assignmentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isClassManager: boolean;
  canManageAssignments: boolean;
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

  useEffect(() => {
    const restoreSession = async () => {
      try {

        const cached = await AsyncStorage.getItem(LOCAL_USER_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          walletService.setUserId(parsed.id);
          scheduleService.setUserId(parsed.id);
          assignmentService.setUserId(parsed.id);
        }

        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const profile = await authService.fetchProfile(
            data.session.user.id,
            data.session.user.email || ''
          );
          setUser(profile);
          await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
          walletService.setUserId(profile.id);
          scheduleService.setUserId(profile.id);
          assignmentService.setUserId(profile.id);
        }
      } catch (err) {
        console.warn('Session restore error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {

        if (user && !user.id.startsWith('admin_demo') && !user.id.startsWith('student_demo')) {
          setUser(null);
          await AsyncStorage.removeItem(LOCAL_USER_KEY);
          walletService.setUserId(null);
          scheduleService.setUserId(null);
        }
      } else if (session.user) {
        const profile = await authService.fetchProfile(
          session.user.id,
          session.user.email || ''
        );
        setUser(profile);
        await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        walletService.setUserId(profile.id);
        scheduleService.setUserId(profile.id);
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
      await walletService.setUserId(profile.id);
      await scheduleService.setUserId(profile.id);
      await assignmentService.setUserId(profile.id);
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
      await walletService.setUserId(profile.id);
      await scheduleService.setUserId(profile.id);
      await assignmentService.setUserId(profile.id);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (targetRole: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      let targetUser = DEMO_STUDENT;
      if (targetRole === 'admin') targetUser = DEMO_ADMIN;
      if (targetRole === 'class_manager') targetUser = DEMO_CLASS_MANAGER;

      setUser(targetUser);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(targetUser));
      await walletService.setUserId(targetUser.id);
      await scheduleService.setUserId(targetUser.id);
      await assignmentService.setUserId(targetUser.id);
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
      walletService.setUserId(null);
      scheduleService.setUserId(null);
      assignmentService.setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isClassManager = role === 'class_manager';
  const canManageAssignments = role === 'class_manager' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isClassManager,
        canManageAssignments,
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
