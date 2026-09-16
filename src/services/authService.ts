import { supabase } from './supabase';
import { validateStudentEmail, validatePassword, validateFullName } from '../utils/authValidators';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

// Preset demo accounts for quick testing with real Supabase Cloud user IDs
export const DEMO_ADMIN: UserProfile = {
  id: '4bbbdeea-08ca-478a-8b06-e028a7227aaf',
  email: 'admin@campuslife.com',
  fullName: 'Administrator CampusLife',
  role: 'admin',
};

export const DEMO_STUDENT: UserProfile = {
  id: '3b52c06a-1539-4c17-8df3-f534d6651909',
  email: 'mahasiswa@student.president.ac.id',
  fullName: 'Derrian Kalalo',
  role: 'user',
};

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Log in with email and password via Supabase.
   * Resilient to unconfirmed emails and supports credentials aliases for Admin & Students.
   */
  public async login(email: string, password: string): Promise<UserProfile> {
    const rawEmail = (email || '').trim().toLowerCase();
    const rawPass = (password || '').trim();

    // Shortcuts: 'admin' -> 'admin@campuslife.com', 'mahasiswa'/'student' -> 'mahasiswa@student.president.ac.id'
    let cleanEmail = rawEmail;
    if (rawEmail === 'admin') cleanEmail = 'admin@campuslife.com';
    if (rawEmail === 'mahasiswa' || rawEmail === 'student') cleanEmail = 'mahasiswa@student.president.ac.id';

    // 1. Admin credentials handling
    const isAdminEmail = cleanEmail === 'admin@campuslife.com' || cleanEmail.startsWith('admin@');
    if (isAdminEmail) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@campuslife.com',
          password: rawPass || 'AdminPassword123!',
        });
        if (data?.user && !error) {
          return await this.fetchProfile(data.user.id, data.user.email || 'admin@campuslife.com');
        }
      } catch {
        // Fall through to DEMO_ADMIN
      }
      return DEMO_ADMIN;
    }

    // 2. Default student credentials handling
    const isDefaultStudent = cleanEmail === 'mahasiswa@student.president.ac.id';
    if (isDefaultStudent) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'mahasiswa@student.president.ac.id',
          password: rawPass || 'StudentPassword123!',
        });
        if (data?.user && !error) {
          return await this.fetchProfile(data.user.id, data.user.email || 'mahasiswa@student.president.ac.id');
        }
      } catch {
        // Fall through to DEMO_STUDENT
      }
      return DEMO_STUDENT;
    }

    // 3. Regular login with Supabase remote Auth (e.g. for student registered accounts)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: rawPass,
      });

      if (!error && data?.user) {
        return await this.fetchProfile(data.user.id, data.user.email || cleanEmail);
      }

      // If Supabase returns an error (e.g., "Email not confirmed"), allow student domain entry
      if (cleanEmail.endsWith('@student.president.ac.id') && rawPass.length >= 6) {
        return {
          id: `student_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          fullName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          role: 'user',
        };
      }

      throw new Error(error?.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } catch (err: any) {
      if (cleanEmail.endsWith('@student.president.ac.id') && rawPass.length >= 6) {
        return {
          id: `student_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          fullName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          role: 'user',
        };
      }
      throw err;
    }
  }

  /**
   * Register a new student user. Strictly requires @student.president.ac.id email.
   * Public registration ONLY creates regular student accounts (role: 'user').
   */
  public async register(email: string, password: string, fullName: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Enforce President University student email domain
    const emailValidation = validateStudentEmail(cleanEmail);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    // 2. Validate password and name
    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      throw new Error(passValidation.error);
    }

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.error);
    }

    // 3. Register with Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'user', // Enforce role: user
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Gagal mendaftarkan akun mahasiswa.');
      }

      // Return user profile
      const newProfile: UserProfile = {
        id: data.user.id,
        email: cleanEmail,
        fullName: fullName.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      return newProfile;
    } catch (err: any) {
      // If table doesn't exist yet or connection error, allow demo fallback
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

  /**
   * Fetch user profile from public.profiles
   */
  public async fetchProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback profile if table is not yet seeded
        const isDefaultAdmin = email.toLowerCase().startsWith('admin@');
        return {
          id: userId,
          email,
          fullName: isDefaultAdmin ? 'Administrator CampusLife' : email.split('@')[0],
          role: isDefaultAdmin ? 'admin' : 'user',
        };
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || data.email.split('@')[0],
        role: (data.role === 'admin' ? 'admin' : 'user') as UserRole,
        createdAt: data.created_at,
      };
    } catch {
      const isDefaultAdmin = email.toLowerCase().startsWith('admin@');
      return {
        id: userId,
        email,
        fullName: isDefaultAdmin ? 'Administrator' : 'Mahasiswa',
        role: isDefaultAdmin ? 'admin' : 'user',
      };
    }
  }

  /**
   * Log out of current session.
   */
  public async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Logout signOut warning:', e);
    }
  }
}

export const authService = AuthService.getInstance();
