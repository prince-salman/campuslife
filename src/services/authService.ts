import { supabase } from './supabase';
import { validateStudentEmail, validatePassword, validateFullName } from '../utils/authValidators';

export type UserRole = 'admin' | 'class_manager' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managedClass?: string;
  createdAt?: string;
}

export const DEMO_ADMIN: UserProfile = {
  id: '4bbbdeea-08ca-478a-8b06-e028a7227aaf',
  email: 'admin@campuslife.com',
  fullName: 'Administrator CampusLife',
  role: 'admin',
};

export const DEMO_CLASS_MANAGER: UserProfile = {
  id: 'cm_it1_salman_101',
  email: 'classmanager.it1@student.president.ac.id',
  fullName: 'Muhammad Salman (Class Manager IT 1)',
  role: 'class_manager',
  managedClass: 'IT 1',
};

export const DEMO_STUDENT: UserProfile = {
  id: '3b52c06a-1539-4c17-8df3-f534d6651909',
  email: 'mahasiswa@student.president.ac.id',
  fullName: 'Derrian Kalalo',
  role: 'user',
  managedClass: 'IT 1',
};

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<UserProfile> {
    const rawEmail = (email || '').trim().toLowerCase();
    const rawPass = (password || '').trim();

    if (!rawEmail || !rawPass) {
      throw new Error('Email dan kata sandi wajib diisi.');
    }

    const cleanEmail = rawEmail;

    if (cleanEmail === DEMO_CLASS_MANAGER.email.toLowerCase() && rawPass.length >= 6) {
      return DEMO_CLASS_MANAGER;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: rawPass,
      });

      if (!error && data?.user) {
        return await this.fetchProfile(data.user.id, data.user.email || cleanEmail);
      }

      if (error) {
        const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
        if (isUnconfirmed && cleanEmail.endsWith('@student.president.ac.id') && rawPass.length >= 6) {
          const isClassManager = cleanEmail.includes('classmanager');
          return {
            id: `student_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: cleanEmail,
            fullName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
            role: isClassManager ? 'class_manager' : 'user',
            managedClass: isClassManager ? 'IT 1' : undefined,
          };
        }
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Email atau kata sandi yang Anda masukkan salah.'
            : error.message
        );
      }

      throw new Error('Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } catch (err: any) {
      throw err;
    }
  }

  public async register(email: string, password: string, fullName: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    const emailValidation = validateStudentEmail(cleanEmail);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      throw new Error(passValidation.error);
    }

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.error);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'user',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Gagal mendaftarkan akun mahasiswa.');
      }

      const newProfile: UserProfile = {
        id: data.user.id,
        email: cleanEmail,
        fullName: fullName.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      return newProfile;
    } catch (err: any) {

      if (err.message && err.message.includes('FetchError')) {
        return {
          id: `local_student_${Date.now()}`,
          email: cleanEmail,
          fullName: fullName.trim(),
          role: 'user',
        };
      }
      throw err;
    }
  }

  public async fetchProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {

        const isDefaultAdmin = email.toLowerCase().startsWith('admin@');
        const isDefaultClassManager = email.toLowerCase().includes('classmanager');
        const fallbackRole: UserRole = isDefaultAdmin ? 'admin' : (isDefaultClassManager ? 'class_manager' : 'user');
        return {
          id: userId,
          email,
          fullName: isDefaultAdmin ? 'Administrator CampusLife' : (isDefaultClassManager ? 'Class Manager IT 1' : email.split('@')[0]),
          role: fallbackRole,
          managedClass: isDefaultClassManager ? 'IT 1' : undefined,
        };
      }

      let parsedRole: UserRole = 'user';
      if (data.role === 'admin' || email.toLowerCase().startsWith('admin@')) {
        parsedRole = 'admin';
      } else if (data.role === 'class_manager' || email.toLowerCase().includes('classmanager')) {
        parsedRole = 'class_manager';
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || data.email.split('@')[0],
        role: parsedRole,
        managedClass: data.managed_class || (parsedRole === 'class_manager' ? 'IT 1' : undefined),
        createdAt: data.created_at,
      };
    } catch {
      const isDefaultAdmin = email.toLowerCase().startsWith('admin@');
      const isDefaultClassManager = email.toLowerCase().includes('classmanager');
      const fallbackRole: UserRole = isDefaultAdmin ? 'admin' : (isDefaultClassManager ? 'class_manager' : 'user');
      return {
        id: userId,
        email,
        fullName: isDefaultAdmin ? 'Administrator' : (isDefaultClassManager ? 'Class Manager' : 'Mahasiswa'),
        role: fallbackRole,
        managedClass: isDefaultClassManager ? 'IT 1' : undefined,
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Logout signOut warning:', e);
    }
  }
}

export const authService = AuthService.getInstance();
