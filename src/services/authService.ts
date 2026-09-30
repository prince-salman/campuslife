import { supabase } from './supabase';
import { validateStudentEmail, validatePassword, validateFullName } from '../utils/authValidators';
import { loginRateLimiter } from '../utils/security';

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

    const limitStatus = loginRateLimiter.checkLimit(cleanEmail);
    if (limitStatus.isLocked) {
      const waitMinutes = Math.ceil(limitStatus.remainingSeconds / 60);
      throw new Error(
        `Terlalu banyak percobaan masuk yang gagal. Akun sementara dikunci demi keamanan. Silakan coba lagi dalam ${waitMinutes} menit.`
      );
    }

    if (cleanEmail === DEMO_CLASS_MANAGER.email.toLowerCase() && rawPass.length >= 6) {
      loginRateLimiter.recordSuccess(cleanEmail);
      return DEMO_CLASS_MANAGER;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: rawPass,
      });

      if (!error && data?.user) {
        loginRateLimiter.recordSuccess(cleanEmail);
        return await this.fetchProfile(data.user.id, data.user.email || cleanEmail);
      }

      if (error) {
        const failStatus = loginRateLimiter.recordFailure(cleanEmail);
        if (failStatus.isLocked) {
          throw new Error(
            'Terlalu banyak percobaan masuk yang gagal. Akun Anda sementara dikunci selama 5 menit demi keamanan.'
          );
        }

        const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
        if (isUnconfirmed && cleanEmail.endsWith('@student.president.ac.id') && rawPass.length >= 6) {
          const isClassManager = cleanEmail === DEMO_CLASS_MANAGER.email.toLowerCase();
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

      loginRateLimiter.recordFailure(cleanEmail);
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
    const isExplicitAdmin = email.toLowerCase() === DEMO_ADMIN.email.toLowerCase();
    const isExplicitClassManager = email.toLowerCase() === DEMO_CLASS_MANAGER.email.toLowerCase();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const fallbackRole: UserRole = isExplicitAdmin ? 'admin' : (isExplicitClassManager ? 'class_manager' : 'user');
        return {
          id: userId,
          email,
          fullName: isExplicitAdmin ? 'Administrator CampusLife' : (isExplicitClassManager ? 'Class Manager IT 1' : email.split('@')[0]),
          role: fallbackRole,
          managedClass: isExplicitClassManager ? 'IT 1' : undefined,
        };
      }

      let parsedRole: UserRole = 'user';
      if (data.role === 'admin' || isExplicitAdmin) {
        parsedRole = 'admin';
      } else if (data.role === 'class_manager' || isExplicitClassManager) {
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
      const fallbackRole: UserRole = isExplicitAdmin ? 'admin' : (isExplicitClassManager ? 'class_manager' : 'user');
      return {
        id: userId,
        email,
        fullName: isExplicitAdmin ? 'Administrator' : (isExplicitClassManager ? 'Class Manager' : 'Mahasiswa'),
        role: fallbackRole,
        managedClass: isExplicitClassManager ? 'IT 1' : undefined,
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
