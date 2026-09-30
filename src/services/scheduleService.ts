import { DaySchedule, ScheduleItem } from '../models/schedule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type Listener = () => void;

const DEMO_STUDENT_ID = '3b52c06a-1539-4c17-8df3-f534d6651909';
const STORAGE_PREFIX = '@campuslife_schedule_user_v8_';

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

export const DEFAULT_DEMO_WEEK_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'Sen',
    dayNumber: '01',
    items: [
      {
        id: 'puis_mon_1',
        time: '09',
        timePeriod: 'am',
        timeRange: '09:30 WIB - 11:45 WIB',
        title: 'Web Programming',
        room: 'LabA209',
        lecturer: 'Anggraini Dyah Ayu Sekarlangit',
        duration: '2 Jam 15 Mnt',
        headerColor: '#1E3A5F',
        cardColor: '#2563EB',
      },
      {
        id: 'puis_mon_2',
        time: '12',
        timePeriod: 'pm',
        timeRange: '12:00 WIB - 13:30 WIB',
        title: 'Economic Survival 1: Gen-AI & Business Project',
        room: 'B202',
        lecturer: 'Mark Ian Murray & Cornellius Suyadi',
        duration: '1.5 Jam',
        headerColor: '#4A1D96',
        cardColor: '#7C3AED',
      },
    ],
  },
  {
    dayName: 'Sel',
    dayNumber: '02',
    items: [],
  },
  {
    dayName: 'Rab',
    dayNumber: '03',
    items: [
      {
        id: 'puis_wed_1',
        time: '07',
        timePeriod: 'am',
        timeRange: '07:00 WIB - 09:15 WIB',
        title: 'Calculus',
        room: 'B408',
        lecturer: 'Hendra Jayanto',
        duration: '2 Jam 15 Mnt',
        headerColor: '#065F46',
        cardColor: '#059669',
      },
      {
        id: 'puis_wed_2',
        time: '02',
        timePeriod: 'pm',
        timeRange: '14:30 WIB - 16:45 WIB',
        title: 'Discrete Mathematics',
        room: 'B309',
        lecturer: 'Rosalina',
        duration: '2 Jam 15 Mnt',
        headerColor: '#0E7490',
        cardColor: '#06B6D4',
      },
    ],
  },
  {
    dayName: 'Kam',
    dayNumber: '04',
    items: [
      {
        id: 'puis_thu_1',
        time: '09',
        timePeriod: 'am',
        timeRange: '09:30 WIB - 11:45 WIB',
        title: 'Programming Concepts',
        room: 'B104',
        lecturer: 'Rikip Ginanjar',
        duration: '2 Jam 15 Mnt',
        headerColor: '#92400E',
        cardColor: '#D97706',
      },
      {
        id: 'puis_thu_2',
        time: '02',
        timePeriod: 'pm',
        timeRange: '14:30 WIB - 16:45 WIB',
        title: 'Computer Network',
        room: 'B404',
        lecturer: 'Abdul Ghofir',
        duration: '2 Jam 15 Mnt',
        headerColor: '#831843',
        cardColor: '#DB2777',
      },
    ],
  },
  {
    dayName: 'Jum',
    dayNumber: '05',
    items: [
      {
        id: 'puis_fri_1',
        time: '09',
        timePeriod: 'am',
        timeRange: '09:30 WIB - 11:45 WIB',
        title: 'Probability and Statistics',
        room: 'A424',
        lecturer: 'Rusdianto Roestam',
        duration: '2 Jam 15 Mnt',
        headerColor: '#4338CA',
        cardColor: '#6366F1',
      },
      {
        id: 'puis_fri_2',
        time: '05',
        timePeriod: 'pm',
        timeRange: '17:00 WIB - 19:15 WIB',
        title: 'Survival English',
        room: 'C202 (PUCC)',
        lecturer: 'Parker Adam Birkenbach',
        duration: '2 Jam 15 Mnt',
        headerColor: '#164E63',
        cardColor: '#0284C7',
      },
    ],
  },
  {
    dayName: 'Sab',
    dayNumber: '06',
    items: [],
  },
  {
    dayName: 'Min',
    dayNumber: '07',
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

  public async setUserId(userId: string | null): Promise<void> {
    this.currentUserId = userId;

    if (!userId) {
      this.weekSchedule = this.createEmptyWeekSchedule();
      this.notify();
      return;
    }

    this.weekSchedule = this.getSampleDemoSchedule();

    try {
      const storageKey = this.getStorageKey(userId);
      const savedData = await safeScheduleStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length === 7) {
          const hasInvalidRosalina = parsed.some((day: DaySchedule) => {
            const rosalinaItems = day.items.filter((it: ScheduleItem) =>
              it.lecturer.toLowerCase().includes('rosalina') || it.title.toLowerCase().includes('discrete')
            );
            return rosalinaItems.length > 1;
          });
          if (hasInvalidRosalina) {
            this.weekSchedule = this.getSampleDemoSchedule();
            await this.saveToStorage();
          } else {
            this.weekSchedule = parsed;
          }
          this.syncCurrentWeekDates();
        }
      } else {
        await this.saveToStorage();
      }

      this.syncWithSupabase(userId);
    } catch {
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

  public getFirstLesson(): ScheduleItem | null {
    const selectedDay = this.weekSchedule[this.selectedDayIndex];
    if (selectedDay && selectedDay.items.length > 0) {
      return selectedDay.items[0];
    }

    for (const day of this.weekSchedule) {
      if (day.items.length > 0) {
        return day.items[0];
      }
    }

    return null;
  }

  public async replaceWeekSchedule(newSchedule: DaySchedule[]): Promise<void> {
    const baseDate = new Date();
    const dayOfWeek = (baseDate.getDay() + 6) % 7;
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    this.weekSchedule = newSchedule.map((day, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      return {
        ...day,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        items: day.items.map((it) => ({ ...it })),
      };
    });

    await this.saveToStorage();
    if (this.currentUserId) {
      this.syncWithSupabase(this.currentUserId);
    }
    this.notify();
  }

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

  public getActiveCourses(): string[] {
    const set = new Set<string>();
    for (const day of this.weekSchedule) {
      for (const item of day.items) {
        if (item.title) {
          const baseName = item.title.replace(/\s*\((Lab|Theory)\)/i, '').trim();
          set.add(baseName);
        }
      }
    }
    return Array.from(set);
  }

  public async setScheduleItemCancelled(
    dayIndex: number,
    itemId: string,
    isCancelled: boolean,
    reason?: string,
    cancelledBy?: string
  ): Promise<boolean> {
    const day = this.weekSchedule[dayIndex];
    if (!day) return false;

    const itemIndex = day.items.findIndex((it) => it.id === itemId);
    if (itemIndex === -1) return false;

    const existing = day.items[itemIndex];
    day.items[itemIndex] = {
      ...existing,
      isCancelled,
      cancelledReason: isCancelled ? (reason || 'Dosen Berhalangan Hadir (Dibatalkan Class Manager)') : undefined,
      cancelledAt: isCancelled ? new Date().toISOString() : undefined,
      cancelledBy: isCancelled ? (cancelledBy || 'Class Manager') : undefined,
    };

    await this.saveToStorage();
    this.notify();

    if (this.currentUserId) {
      this.syncUpdateToSupabase(day.items[itemIndex]);
    }

    return true;
  }

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
    }
  }

  private async syncDeleteFromSupabase(itemId: string): Promise<void> {
    try {
      await supabase.from('schedules').delete().eq('id', itemId);
    } catch {
    }
  }
}

export const scheduleService = ScheduleService.getInstance();
