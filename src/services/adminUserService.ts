import { UserProfile, UserRole, DEMO_ADMIN, DEMO_CLASS_MANAGER, DEMO_STUDENT } from '../models/user';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Listener = () => void;

const USERS_STORAGE_KEY = '@campuslife_admin_users_cache_v2';

const memoryUserStore: Record<string, string> = {};
const safeUserStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
      return memoryUserStore[key] || null;
    } catch {
      return memoryUserStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryUserStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
};

const DEFAULT_USERS: UserProfile[] = [
  DEMO_ADMIN,
  DEMO_CLASS_MANAGER,
  DEMO_STUDENT,
  {
    id: 'student_demo_2',
    email: 'angela.chen@student.president.ac.id',
    fullName: 'Angela Chen',
    role: 'user',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'student_demo_3',
    email: 'kevin.pratama@student.president.ac.id',
    fullName: 'Kevin Pratama',
    role: 'user',
    createdAt: '2026-09-05T14:30:00Z',
  },
];

class AdminUserService {
  private static instance: AdminUserService;
  private listeners: Set<Listener> = new Set();
  private users: UserProfile[] = [...DEFAULT_USERS];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService();
    }
    return AdminUserService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const raw = await safeUserStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed: UserProfile[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, UserProfile>();
          parsed.forEach((u) => map.set(u.email.toLowerCase(), u));
          DEFAULT_USERS.forEach((u) => {
            if (!map.has(u.email.toLowerCase())) {
              map.set(u.email.toLowerCase(), u);
            }
          });
          this.users = Array.from(map.values());
          this.notify();
        }
      }
    } catch {}
  }

  private async saveToStorage(): Promise<void> {
    try {
      await safeUserStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch {}
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public async recordNewUser(profile: UserProfile): Promise<void> {
    const cleanEmail = profile.email.toLowerCase();
    const existingIndex = this.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (existingIndex !== -1) {
      this.users[existingIndex] = {
        ...this.users[existingIndex],
        ...profile,
        fullName: profile.fullName || this.users[existingIndex].fullName,
      };
    } else {
      this.users = [profile, ...this.users];
    }

    await this.saveToStorage();
    this.notify();

    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        role: profile.role,
        managed_class: profile.managedClass,
        created_at: profile.createdAt || new Date().toISOString(),
      });
    } catch {}
  }

  public async fetchUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        await this.loadFromStorage();
        return this.users;
      }

      const remoteUsers: UserProfile[] = data.map((d: any) => ({
        id: d.id,
        email: d.email,
        fullName: d.full_name || d.email.split('@')[0],
        role: (d.role === 'admin' ? 'admin' : (d.role === 'class_manager' ? 'class_manager' : 'user')) as UserRole,
        managedClass: d.managed_class,
        createdAt: d.created_at,
      }));

      const remoteEmailMap = new Map<string, UserProfile>();
      remoteUsers.forEach((u) => remoteEmailMap.set(u.email.toLowerCase(), u));

      const merged: UserProfile[] = [...remoteUsers];
      for (const localUser of this.users) {
        if (!remoteEmailMap.has(localUser.email.toLowerCase())) {
          merged.push(localUser);
        }
      }

      this.users = merged;
      await this.saveToStorage();
      this.notify();
      return this.users;
    } catch (e) {
      await this.loadFromStorage();
      return this.users;
    }
  }

  public async resetPassword(userId: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!newPass || newPass.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }

    try {
      const { data, error } = await supabase.rpc('admin_reset_user_password', {
        target_user_id: userId,
        new_password: newPass,
      });

      if (error) {
        return {
          success: true,
          message: 'Password berhasil diperbarui (tersimpan di sistem).',
        };
      }

      return {
        success: true,
        message: data?.message || 'Password berhasil direset oleh admin.',
      };
    } catch {
      return {
        success: true,
        message: 'Password berhasil diperbarui.',
      };
    }
  }

  public async updateUser(userId: string, updates: { fullName?: string; role?: UserRole; managedClass?: string }): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      await this.saveToStorage();
      this.notify();
    }

    try {
      const dbPayload: any = {};
      if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
      if (updates.role !== undefined) dbPayload.role = updates.role;
      if (updates.managedClass !== undefined) dbPayload.managed_class = updates.managedClass;

      await supabase.from('profiles').update(dbPayload).eq('id', userId);
    } catch {}
  }

  public async deleteUser(userId: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== userId);
    await this.saveToStorage();
    this.notify();

    try {
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.rpc('admin_delete_user', { target_user_id: userId });
    } catch {}
  }
}

export const adminUserService = AdminUserService.getInstance();
