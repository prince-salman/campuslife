import { AssignmentTask, TaskPriority, TaskStatus } from '../models/assignment';
import { UserProfile } from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { sanitizeExternalUrl, sanitizeInput } from '../utils/security';

type Listener = () => void;

const ASSIGNMENTS_STORAGE_KEY = '@campuslife_assignments_v5';
const COMPLETED_TASKS_PREFIX = '@campuslife_task_done_';

export const AVAILABLE_CLASSES = ['IT 1'];

const INITIAL_DEMO_ASSIGNMENTS: AssignmentTask[] = [];

export interface CreateAssignmentInput {
  className: string;
  courseName: string;
  title: string;
  description: string;
  deadlineDate: string;
  deadlineTime: string;
  priority: TaskPriority;
  submissionLink?: string;
}

export class AssignmentService {
  private static instance: AssignmentService;
  private assignments: AssignmentTask[] = [...INITIAL_DEMO_ASSIGNMENTS];
  private listeners: Listener[] = [];
  private isLoaded: boolean = false;
  private completedTaskIds: Set<string> = new Set();
  private currentUserId: string | null = null;

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
    this.loadUserCompletedTasks();
  }

  private async loadUserCompletedTasks() {
    if (!this.currentUserId) {
      this.completedTaskIds = new Set();
      this.notifyListeners();
      return;
    }
    try {
      const saved = await AsyncStorage.getItem(COMPLETED_TASKS_PREFIX + this.currentUserId);
      if (saved) {
        this.completedTaskIds = new Set(JSON.parse(saved));
      } else {
        this.completedTaskIds = new Set();
      }
      this.notifyListeners();
    } catch {
      this.completedTaskIds = new Set();
    }
  }

  private async saveUserCompletedTasks() {
    if (!this.currentUserId) return;
    try {
      await AsyncStorage.setItem(
        COMPLETED_TASKS_PREFIX + this.currentUserId,
        JSON.stringify(Array.from(this.completedTaskIds))
      );
    } catch (e) {
      console.warn('Failed to save completed tasks', e);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (stored) {
        const parsed: AssignmentTask[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.assignments = parsed;
        }
      }

      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .order('deadline_date', { ascending: true });

        if (!error && data && data.length > 0) {
          this.assignments = data.map((d: any) => ({
            id: d.id,
            className: d.class_name || d.className || 'IT 1',
            courseName: d.course_name || d.courseName,
            title: d.title,
            description: d.description || '',
            deadlineDate: d.deadline_date || d.deadlineDate,
            deadlineTime: d.deadline_time || d.deadlineTime || '23:59 WIB',
            priority: d.priority || 'medium',
            status: d.status || 'pending',
            submissionLink: d.submission_link || d.submissionLink,
            createdBy: d.created_by || d.createdBy || 'Class Manager',
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
          }));
          await this.saveToStorage();
        }
      } catch {

      }
    } catch (err) {
      console.warn('Assignment load error:', err);
    } finally {
      this.isLoaded = true;
      this.notifyListeners();
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(this.assignments));
    } catch (err) {
      console.warn('Failed saving assignments to local storage:', err);
    }
  }

  public getAssignments(className?: string): AssignmentTask[] {
    const targetClass = className && className !== 'Semua' ? className : 'IT 1';
    return this.assignments.filter((t) => t.className.toLowerCase() === targetClass.toLowerCase());
  }

  public getAvailableClasses(): string[] {
    return AVAILABLE_CLASSES;
  }

  public isTaskCompletedByUser(taskId: string): boolean {
    return this.completedTaskIds.has(taskId);
  }

  public async toggleUserTaskCompleted(taskId: string): Promise<boolean> {
    if (this.completedTaskIds.has(taskId)) {
      this.completedTaskIds.delete(taskId);
    } else {
      this.completedTaskIds.add(taskId);
    }
    await this.saveUserCompletedTasks();
    this.notifyListeners();
    return this.completedTaskIds.has(taskId);
  }

  public async addAssignment(
    input: CreateAssignmentInput,
    user: UserProfile | null
  ): Promise<AssignmentTask> {
    if (!user || (user.role !== 'class_manager' && user.role !== 'admin')) {
      throw new Error('Akses Ditolak: Hanya Class Manager atau Administrator yang berwenang menambahkan tugas.');
    }

    let safeSubmissionLink: string | undefined = undefined;
    if (input.submissionLink && input.submissionLink.trim()) {
      const sanitized = sanitizeExternalUrl(input.submissionLink.trim());
      if (!sanitized) {
        throw new Error('Tautan pengumpulan tidak valid atau tidak aman. Gunakan URL berawalan http:// atau https://');
      }
      safeSubmissionLink = sanitized;
    }

    const newTask: AssignmentTask = {
      id: `task_${Date.now()}`,
      className: input.className || 'IT 1',
      courseName: sanitizeInput(input.courseName.trim(), 100),
      title: sanitizeInput(input.title.trim(), 150),
      description: sanitizeInput(input.description.trim(), 2000),
      deadlineDate: input.deadlineDate,
      deadlineTime: input.deadlineTime || '23:59 WIB',
      priority: input.priority || 'medium',
      status: 'pending',
      submissionLink: safeSubmissionLink,
      createdBy: `${user.fullName} (${user.role === 'admin' ? 'Admin' : 'Class Manager ' + (user.managedClass || 'IT 1')})`,
      createdAt: new Date().toISOString(),
    };

    this.assignments.unshift(newTask);
    await this.saveToStorage();

    try {
      await supabase.from('assignments').insert({
        id: newTask.id,
        class_name: newTask.className,
        course_name: newTask.courseName,
        title: newTask.title,
        description: newTask.description,
        deadline_date: newTask.deadlineDate,
        deadline_time: newTask.deadlineTime,
        priority: newTask.priority,
        status: newTask.status,
        submission_link: newTask.submissionLink,
        created_by: newTask.createdBy,
        created_at: newTask.createdAt,
      });
    } catch {}

    this.notifyListeners();
    return newTask;
  }

  public async updateAssignment(
    taskId: string,
    updates: Partial<CreateAssignmentInput>,
    user: UserProfile | null
  ): Promise<AssignmentTask> {
    if (!user || (user.role !== 'class_manager' && user.role !== 'admin')) {
      throw new Error('Akses Ditolak: Hanya Class Manager atau Administrator yang berwenang mengedit tugas.');
    }

    const index = this.assignments.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error('Tugas tidak ditemukan.');
    }

    const current = this.assignments[index];

    let safeSubmissionLink: string | undefined = current.submissionLink;
    if (updates.submissionLink !== undefined) {
      if (updates.submissionLink.trim() === '') {
        safeSubmissionLink = undefined;
      } else {
        const sanitized = sanitizeExternalUrl(updates.submissionLink.trim());
        if (!sanitized) {
          throw new Error('Tautan pengumpulan tidak valid atau tidak aman. Gunakan URL berawalan http:// atau https://');
        }
        safeSubmissionLink = sanitized;
      }
    }

    const updated: AssignmentTask = {
      ...current,
      className: updates.className ?? current.className,
      courseName: updates.courseName ? sanitizeInput(updates.courseName.trim(), 100) : current.courseName,
      title: updates.title ? sanitizeInput(updates.title.trim(), 150) : current.title,
      description: updates.description !== undefined ? sanitizeInput(updates.description.trim(), 2000) : current.description,
      deadlineDate: updates.deadlineDate ?? current.deadlineDate,
      deadlineTime: updates.deadlineTime ?? current.deadlineTime,
      priority: updates.priority ?? current.priority,
      submissionLink: safeSubmissionLink,
    };

    this.assignments[index] = updated;
    await this.saveToStorage();

    try {
      await supabase.from('assignments').update({
        class_name: updated.className,
        course_name: updated.courseName,
        title: updated.title,
        description: updated.description,
        deadline_date: updated.deadlineDate,
        deadline_time: updated.deadlineTime,
        priority: updated.priority,
        submission_link: updated.submissionLink,
      }).eq('id', taskId);
    } catch {}

    this.notifyListeners();
    return updated;
  }

  public async deleteAssignment(taskId: string, user: UserProfile | null): Promise<void> {
    if (!user || (user.role !== 'class_manager' && user.role !== 'admin')) {
      throw new Error('Akses Ditolak: Hanya Class Manager atau Administrator yang berwenang menghapus tugas.');
    }

    this.assignments = this.assignments.filter((t) => t.id !== taskId);
    await this.saveToStorage();

    try {
      await supabase.from('assignments').delete().eq('id', taskId);
    } catch {}

    this.notifyListeners();
  }

  public async syncAssignmentsFromPuisCourses(
    className: string = 'IT 1',
    user?: UserProfile | null
  ): Promise<number> {
    const creator = user ? `${user.fullName || user.email} (Class Manager ${className})` : `Class Manager ${className}`;

    const PUIS_DEFAULT_TASKS: Record<string, { title: string; description: string; priority: TaskPriority; daysAhead: number }> = {
      'Web Programming': {
        title: 'Praktikum Web: Responsive Layout & Flexbox UI',
        description: 'Implementasikan layout portfolio responsif menggunakan semantic HTML5 dan CSS Flexbox sesuai instruksi praktikum Ibu Anggraini Dyah Ayu Sekarlangit.',
        priority: 'high',
        daysAhead: 5,
      },
      'Calculus': {
        title: 'Problem Set: Limit Fungsi & Turunan Parsial',
        description: 'Kerjakan latihan soal bab limit fungsi dan diferensial untuk optimasi ekstrim dari modul Pak Hendra Jayanto. Kumpulkan scan PDF rapi.',
        priority: 'high',
        daysAhead: 7,
      },
      'Discrete Mathematics': {
        title: 'Tugas Logika Proposisi & Pembuktian Teorema',
        description: 'Buat tabel kebenaran lengkap dan buktikan ekuivalensi logika proposisi sesuai materi kuliah Ibu Rosalina.',
        priority: 'medium',
        daysAhead: 6,
      },
      'Programming Concepts': {
        title: 'Algoritma & Struktur Kontrol Bahasa C++',
        description: 'Selesaikan studi kasus matriks multidimensi dan implementasi sorting algorithm. Kumpulkan file .cpp sebelum sesi kelas Pak Rikip Ginanjar.',
        priority: 'high',
        daysAhead: 4,
      },
      'Computer Network': {
        title: 'Desain Topologi Jaringan & Subnetting VLSM',
        description: 'Rancang simulasi topologi jaringan LAN dengan pembagian IP VLSM menggunakan Cisco Packet Tracer sesuai arahan Pak Abdul Ghofir.',
        priority: 'high',
        daysAhead: 8,
      },
      'Probability and Statistics': {
        title: 'Analisis Data Sampel & Distribusi Peluang Normal',
        description: 'Lakukan pengujian hipotesis dan kalkulasi deviasi standar dari dataset survei mahasiswa sesuai panduan Pak Rusdianto Roestam.',
        priority: 'medium',
        daysAhead: 6,
      },
      'Economic Survival 1': {
        title: 'Business Model Canvas & AI-Powered Pitch Deck',
        description: 'Susun rencana model bisnis rintisan berbasis generative AI bersama tim kelompok untuk review Mark Ian Murray & Cornellius Suyadi.',
        priority: 'medium',
        daysAhead: 9,
      },
      'Survival English': {
        title: 'Academic Presentation & Essay Reflection',
        description: 'Draft 500-word argumentative essay on contemporary technology and prepare a 3-minute oral presentation for Parker Adam Birkenbach.',
        priority: 'normal',
        daysAhead: 7,
      },
    };

    let addedCount = 0;
    const now = new Date();

    for (const [courseName, taskMeta] of Object.entries(PUIS_DEFAULT_TASKS)) {
      const exists = this.assignments.some(
        (a) => a.className === className && a.courseName.toLowerCase().includes(courseName.toLowerCase())
      );

      if (!exists) {
        const deadline = new Date(now);
        deadline.setDate(deadline.getDate() + taskMeta.daysAhead);
        const yyyy = deadline.getFullYear();
        const mm = String(deadline.getMonth() + 1).padStart(2, '0');
        const dd = String(deadline.getDate()).padStart(2, '0');

        const newTask: AssignmentTask = {
          id: `puis_task_${courseName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
          className,
          courseName,
          title: taskMeta.title,
          description: taskMeta.description,
          deadlineDate: `${yyyy}-${mm}-${dd}`,
          deadlineTime: '23:59 WIB',
          priority: taskMeta.priority,
          status: 'pending',
          submissionLink: 'https://ecampus.president.ac.id/',
          createdBy: creator,
          createdAt: new Date().toISOString(),
        };

        this.assignments.unshift(newTask);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await this.saveToStorage();
      this.notifyListeners();
    }

    return addedCount;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }
}

export const assignmentService = AssignmentService.getInstance();
