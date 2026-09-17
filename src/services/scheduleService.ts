import { DaySchedule, ScheduleItem } from '../models/schedule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type Listener = () => void;

const DEMO_STUDENT_ID = '3b52c06a-1539-4c17-8df3-f534d6651909';
const STORAGE_PREFIX = '@campuslife_schedule_user_';

const scheduleMemoryStore: Record<string, string> = {};
const safeScheduleStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
      return scheduleMemoryStore[key] || null;
    } catch {
      return scheduleMemoryStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    scheduleMemoryStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
};

export interface AddScheduleParams {
  dayIndex: number;
  title: string;
  lecturer: string;
  room: string;
  time: string;
  timePeriod: string;
  duration: string;
  timeRange?: string;
  endTime?: string;
  reminderMinutes?: number;
  headerColor?: string;
  cardColor?: string;
}

export interface UpdateScheduleParams {
  dayIndex: number;
  itemId: string;
  title?: string;
  lecturer?: string;
  room?: string;
  time?: string;
  timePeriod?: string;
  duration?: string;
  timeRange?: string;
  endTime?: string;
  reminderMinutes?: number;
  headerColor?: string;
  cardColor?: string;
}

const DEFAULT_DEMO_WEEK_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'Sen',
      dayNumber: '11',
      items: [
        {
          id: 'mon_1',
          time: '08',
          timePeriod: 'am',
          timeRange: '08:00 WIB - 10:30 WIB',
          title: 'Algorithms & Data Structures',
          room: 'B101',
          lecturer: 'Dr. Kenzo Tenma',
          duration: '2.5 Jam',
          headerColor: '#2E6F79',
          cardColor: '#55A4B2',
        },
        {
          id: 'mon_2',
          time: '01',
          timePeriod: 'pm',
          timeRange: '13:00 WIB - 15:00 WIB',
          title: 'Operating Systems',
          room: 'Lab 2',
          lecturer: 'Prof. Wolfgang Grimmer',
          duration: '2 Jam',
          headerColor: '#3B3878',
          cardColor: '#6560B0',
        },
      ],
    },
    {
      dayName: 'Sel',
      dayNumber: '12',
      items: [
        {
          id: 'tue_1',
          time: '10',
          timePeriod: 'am',
          timeRange: '10:00 WIB - 12:00 WIB',
          title: 'Database Management',
          room: 'B204',
          lecturer: 'Ms. Anna Liebert',
          duration: '2 Jam',
          headerColor: '#2E7958',
          cardColor: '#57B288',
        },
      ],
    },
    {
      dayName: 'Rab',
      dayNumber: '13',
      items: [
        {
          id: 'wed_1',
          time: '08',
          timePeriod: 'am',
          timeRange: '08:00 WIB - 11:00 WIB',
          title: 'Software Engineering',
          room: 'C301',
          lecturer: 'Dr. Julius Reichwein',
          duration: '3 Jam',
          headerColor: '#2E6F79',
          cardColor: '#55A4B2',
        },
      ],
    },
    {
      dayName: 'Kam',
      dayNumber: '14',
      items: [
        {
          id: 'thu_1',
          time: '08',
          timePeriod: 'am',
          timeRange: '08:00 WIB - 10:00 WIB',
          title: 'Informatics',
          room: 'B103',
          lecturer: 'Mr. John Liebert',
          duration: '2 Jam',
          headerColor: '#2E7979',
          cardColor: '#5FB8B2',
        },
        {
          id: 'thu_2',
          time: '11',
          timePeriod: 'am',
          timeRange: '11:00 WIB - 13:00 WIB',
          title: 'Linear Algebra',
          room: 'A201',
          lecturer: 'Dr. Johan Liebert',
          duration: '2 Jam',
          headerColor: '#274975',
          cardColor: '#4D7FA9',
        },
        {
          id: 'thu_3',
          time: '02',
          timePeriod: 'pm',
          timeRange: '14:00 WIB - 17:00 WIB',
          title: 'Web Development Lab',
          room: 'Lab 1',
          lecturer: 'Mr. Salman',
          duration: '3 Jam',
          headerColor: '#5A2E79',
          cardColor: '#8C5FB8',
        },
      ],
    },
    {
      dayName: 'Jum',
      dayNumber: '15',
      items: [
        {
          id: 'fri_1',
          time: '09',
          timePeriod: 'am',
          timeRange: '09:00 WIB - 11:00 WIB',
          title: 'Computer Networks',
          room: 'B102',
          lecturer: 'Mr. Richard Braun',
          duration: '2 Jam',
          headerColor: '#792E4D',
          cardColor: '#B85F82',
        },
      ],
    },
    {
      dayName: 'Sab',
      dayNumber: '16',
      items: [
        {
          id: 'sat_1',
          time: '10',
          timePeriod: 'am',
          timeRange: '10:00 WIB - 13:00 WIB',
          title: 'Public Speaking Seminar',
          room: 'Auditorium',
          lecturer: 'Guest Speaker',
          duration: '3 Jam',
          headerColor: '#755127',
          cardColor: '#A87D4C',
        },
      ],
    },
    {
      dayName: 'Min',
      dayNumber: '17',
      items: [],
    },
  ];

export class ScheduleService {
  private static instance: ScheduleService;
  private listeners: Set<Listener> = new Set();

  private currentUserId: string | null = null;
  private selectedMonthYear: string = 'September, 2026';
  private selectedDayIndex: number = 3;
  private weekSchedule: DaySchedule[] = [];

  private constructor() {
    this.weekSchedule = this.getSampleDemoSchedule();
    this.resetToCurrentDeviceDate();
  }

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public createEmptyWeekSchedule(baseDate: Date = new Date()): DaySchedule[] {
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dayOfWeek = (baseDate.getDay() + 6) % 7;
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    return dayNames.map((name, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      return {
        dayName: name,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        items: [],
      };
    });
  }

  public getSampleDemoSchedule(baseDate: Date = new Date()): DaySchedule[] {
    const dayOfWeek = (baseDate.getDay() + 6) % 7;
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    return DEFAULT_DEMO_WEEK_SCHEDULE.map((day, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      return {
        ...day,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        items: day.items.map((it) => ({ ...it })),
      };
    });
  }

  private getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  /**
   * Set user context and load their private isolated schedule.
   * New registrations start with clean empty calendar schedule.
   * Existing accounts retain their preserved schedule.
   */
  public async setUserId(userId: string | null): Promise<void> {
    this.currentUserId = userId;

    if (!userId) {
      this.weekSchedule = this.createEmptyWeekSchedule();
      this.notify();
      return;
    }

    // Set immediate isolated in-memory default before async read
    if (userId === DEMO_STUDENT_ID) {
      this.weekSchedule = this.getSampleDemoSchedule();
    } else {
      this.weekSchedule = this.createEmptyWeekSchedule();
    }

    try {
      const storageKey = this.getStorageKey(userId);
      const savedData = await safeScheduleStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length === 7) {
          this.weekSchedule = parsed;
          this.syncCurrentWeekDates();
        }
      } else {
        await this.saveToStorage();
      }

      this.syncWithSupabase(userId);
    } catch {
      // Fallback
    }

    this.notify();
  }

  public getUserId(): string | null {
    return this.currentUserId;
  }

  public resetToCurrentDeviceDate(): void {
    const now = new Date();
    const MONTH_NAMES = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    this.selectedMonthYear = `${MONTH_NAMES[now.getMonth()]}, ${now.getFullYear()}`;

    const dayOfWeek = (now.getDay() + 6) % 7;
    this.selectedDayIndex = dayOfWeek;
    this.syncCurrentWeekDates();
  }

  private syncCurrentWeekDates(): void {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      if (this.weekSchedule[i]) {
        this.weekSchedule[i].dayNumber = String(d.getDate()).padStart(2, '0');
      }
    }
  }

  public static calculateEndTime(
    startTimeStr: string,
    period: string,
    durationStr: string
  ): { endTime: string; timeRange: string } {
    let startHour = 8;
    let startMin = 0;
    const cleanTime = (startTimeStr || '08').trim();
    if (cleanTime.includes(':')) {
      const parts = cleanTime.split(':');
      startHour = parseInt(parts[0], 10) || 8;
      startMin = parseInt(parts[1], 10) || 0;
    } else {
      startHour = parseInt(cleanTime, 10) || 8;
      startMin = 0;
    }

    const normPeriod = (period || 'am').toLowerCase();
    let hour24 = startHour;
    if (normPeriod === 'pm' && hour24 < 12) {
      hour24 += 12;
    } else if (normPeriod === 'am' && hour24 === 12) {
      hour24 = 0;
    }

    let durationMinutes = 120;
    const cleanDur = (durationStr || '2 Jam').toLowerCase();
    if (cleanDur.includes('jam') || cleanDur.includes('hour')) {
      const num = parseFloat(cleanDur.replace(/[^0-9.]/g, '')) || 2;
      durationMinutes = Math.round(num * 60);
    } else if (cleanDur.includes('menit') || cleanDur.includes('min')) {
      durationMinutes = parseInt(cleanDur.replace(/[^0-9]/g, ''), 10) || 60;
    } else {
      const num = parseFloat(cleanDur) || 2;
      durationMinutes = Math.round(num * 60);
    }

    const startTotal = hour24 * 60 + startMin;
    const endTotal = (startTotal + durationMinutes) % (24 * 60);
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const startFormatted = `${pad(hour24)}:${pad(startMin)} WIB`;
    const endFormatted = `${pad(endH)}:${pad(endM)} WIB`;

    return {
      endTime: endFormatted,
      timeRange: `${startFormatted} - ${endFormatted}`,
    };
  }

  public getWeekSchedule(): DaySchedule[] {
    return JSON.parse(JSON.stringify(this.weekSchedule));
  }

  public getSelectedMonthYear(): string {
    return this.selectedMonthYear;
  }

  public setSelectedMonthYear(monthYear: string): void {
    this.selectedMonthYear = monthYear;
    this.notify();
  }

  public getSelectedDayIndex(): number {
    return this.selectedDayIndex;
  }

  public setSelectedDayIndex(index: number): void {
    if (index >= 0 && index < this.weekSchedule.length) {
      this.selectedDayIndex = index;
      this.notify();
    }
  }

  /**
   * Mendapatkan jadwal kuliah pertama (First Lesson) untuk ditampilkan di Home.
   * Mencari mata kuliah pertama pada hari yang dipilih. Jika hari itu kosong,
   * mencari mata kuliah pertama berikutnya pada minggu tersebut.
   */
  public getFirstLesson(): ScheduleItem | null {
    const selectedDay = this.weekSchedule[this.selectedDayIndex];
    if (selectedDay && selectedDay.items.length > 0) {
      return selectedDay.items[0];
    }

    // Fallback: cari kelas pertama yang tersedia di hari mana saja
    for (const day of this.weekSchedule) {
      if (day.items.length > 0) {
        return day.items[0];
      }
    }

    return null;
  }

  /**
   * Menambahkan jadwal baru dengan jam selesai dan timeRange otomatis
   */
  public addScheduleItem(params: AddScheduleParams): ScheduleItem {
    const day = this.weekSchedule[params.dayIndex];
    if (!day) {
      throw new Error(`Hari dengan index ${params.dayIndex} tidak ditemukan`);
    }

    const calc = ScheduleService.calculateEndTime(
      params.time,
      params.timePeriod,
      params.duration
    );

    const newItem: ScheduleItem = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title.trim(),
      lecturer: params.lecturer.trim(),
      room: params.room.trim(),
      time: params.time.trim(),
      timePeriod: params.timePeriod.trim() || 'am',
      duration: params.duration.trim() || '2 Jam',
      endTime: params.endTime || calc.endTime,
      timeRange: params.timeRange?.trim() || calc.timeRange,
      reminderMinutes: params.reminderMinutes !== undefined ? params.reminderMinutes : 15,
      headerColor: params.headerColor || '#2E7979',
      cardColor: params.cardColor || '#5FB8B2',
    };

    day.items.push(newItem);
    this.saveToStorage();
    this.notify();

    if (this.currentUserId) {
      this.syncInsertToSupabase(this.currentUserId, params.dayIndex, newItem);
    }

    return newItem;
  }

  /**
   * Mengedit jadwal yang sudah ada
   */
  public updateScheduleItem(params: UpdateScheduleParams): boolean {
    const day = this.weekSchedule[params.dayIndex];
    if (!day) return false;

    const itemIndex = day.items.findIndex((it) => it.id === params.itemId);
    if (itemIndex === -1) return false;

    const existing = day.items[itemIndex];
    const updatedTime = params.time !== undefined ? params.time.trim() : existing.time;
    const updatedPeriod = params.timePeriod !== undefined ? params.timePeriod.trim() : existing.timePeriod;
    const updatedDuration = params.duration !== undefined ? params.duration.trim() : existing.duration;

    const calc = ScheduleService.calculateEndTime(updatedTime, updatedPeriod, updatedDuration);

    day.items[itemIndex] = {
      ...existing,
      title: params.title !== undefined ? params.title.trim() : existing.title,
      lecturer: params.lecturer !== undefined ? params.lecturer.trim() : existing.lecturer,
      room: params.room !== undefined ? params.room.trim() : existing.room,
      time: updatedTime,
      timePeriod: updatedPeriod,
      duration: updatedDuration,
      endTime: params.endTime !== undefined ? params.endTime : calc.endTime,
      timeRange: params.timeRange !== undefined ? params.timeRange.trim() : calc.timeRange,
      reminderMinutes: params.reminderMinutes !== undefined ? params.reminderMinutes : existing.reminderMinutes,
      headerColor: params.headerColor || existing.headerColor,
      cardColor: params.cardColor || existing.cardColor,
    };

    this.saveToStorage();
    this.notify();

    if (this.currentUserId) {
      this.syncUpdateToSupabase(day.items[itemIndex]);
    }

    return true;
  }

  /**
   * Menghapus jadwal
   */
  public deleteScheduleItem(dayIndex: number, itemId: string): boolean {
    const day = this.weekSchedule[dayIndex];
    if (!day) return false;

    const initialLen = day.items.length;
    day.items = day.items.filter((it) => it.id !== itemId);
    const deleted = day.items.length < initialLen;

    if (deleted) {
      this.saveToStorage();
      this.notify();

      if (this.currentUserId) {
        this.syncDeleteFromSupabase(itemId);
      }
    }
    return deleted;
  }

  private async saveToStorage(): Promise<void> {
    if (!this.currentUserId) return;
    try {
      const storageKey = this.getStorageKey(this.currentUserId);
      await safeScheduleStorage.setItem(storageKey, JSON.stringify(this.weekSchedule));
    } catch (e) {
      console.warn('Failed to save schedule storage:', e);
    }
  }

  private async syncWithSupabase(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        const freshWeek = this.createEmptyWeekSchedule();
        for (const row of data) {
          const dayIdx = Number(row.day_index);
          if (freshWeek[dayIdx]) {
            freshWeek[dayIdx].items.push({
              id: row.id,
              title: row.title,
              lecturer: row.lecturer || '',
              room: row.room || '',
              time: row.time || '08',
              timePeriod: row.time_period || 'am',
              duration: row.duration || '2 Jam',
              timeRange: row.time_range || '',
              headerColor: row.header_color || '#2E7979',
              cardColor: row.card_color || '#5FB8B2',
            });
          }
        }
        this.weekSchedule = freshWeek;
        await this.saveToStorage();
        this.notify();
      }
    } catch {
      // Offline fallback
    }
  }

  private async syncInsertToSupabase(userId: string, dayIndex: number, item: ScheduleItem): Promise<void> {
    try {
      await supabase.from('schedules').insert({
        id: item.id,
        user_id: userId,
        day_index: dayIndex,
        day_name: this.weekSchedule[dayIndex]?.dayName || 'Sen',
        day_number: this.weekSchedule[dayIndex]?.dayNumber || '01',
        title: item.title,
        lecturer: item.lecturer,
        room: item.room,
        time: item.time,
        time_period: item.timePeriod,
        time_range: item.timeRange,
        duration: item.duration,
        header_color: item.headerColor,
        card_color: item.cardColor,
      });
    } catch {
      // Offline fallback
    }
  }

  private async syncUpdateToSupabase(item: ScheduleItem): Promise<void> {
    try {
      await supabase.from('schedules').update({
        title: item.title,
        lecturer: item.lecturer,
        room: item.room,
        time: item.time,
        time_period: item.timePeriod,
        time_range: item.timeRange,
        duration: item.duration,
        header_color: item.headerColor,
        card_color: item.cardColor,
      }).eq('id', item.id);
    } catch {
      // Offline fallback
    }
  }

  private async syncDeleteFromSupabase(itemId: string): Promise<void> {
    try {
      await supabase.from('schedules').delete().eq('id', itemId);
    } catch {
      // Offline fallback
    }
  }
}

export const scheduleService = ScheduleService.getInstance();
