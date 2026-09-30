import { DaySchedule, ScheduleItem } from '../models/schedule';
import { PromoBannerModel } from '../models/banner';
import { UmkmModel } from '../models/umkm';
import { TransactionModel } from '../models/transaction';

export const TODAY_SCHEDULE: ScheduleItem = {
  id: 'today_inf',
  title: 'Informatics',
  time: '08',
  timePeriod: 'am',
  timeRange: '08:00 WIB – 10:00 WIB',
  lecturer: 'Mr. John Liebert',
  duration: '2 Hours',
  room: 'B103',
  headerColor: '#2E7979',
  cardColor: '#5FB8B2',
};

export const PROMO_BANNERS: PromoBannerModel[] = [
  {
    id: 'b1',
    title: 'Laundry\nExpress',
    subtitle: 'Menerima Laundry :',
    services: ['Baju', 'Sepatu', 'Selimut', 'Alas Lantai', 'Sprei', 'Jaket'],
    contact: '+123-456-7890',
  },
  {
    id: 'b2',
    title: 'Print &\nFotocopy',
    subtitle: 'Buka 24 Jam :',
    services: ['Skripsi', 'Jilid Hardcover', 'Poster A3', 'Stiker'],
    contact: '+123-888-9999',
  },
];

export const CATEGORIES: string[] = [
  'Laundry',
  'F&B',
  'Homestay',
  'Fotocopy',
  'Holiday',
];

export const UMKM_LIST: UmkmModel[] = [];

export const INITIAL_TRANSACTIONS: TransactionModel[] = [];

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const WEEK_SCHEDULE: DaySchedule[] = [
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
