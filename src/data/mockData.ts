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
    dayName: 'Mon',
    dayNumber: '11',
    items: [
      {
        id: 'mon_1',
        time: '08',
        timePeriod: 'am',
        timeRange: '08:00 – 10:30 WIB',
        title: 'Algorithms & Data Structures',
        room: 'B101',
        lecturer: 'Dr. Kenzo Tenma',
        duration: '2.5 Hours',
        headerColor: '#2E6F79',
        cardColor: '#55A4B2',
      },
      {
        id: 'mon_2',
        time: '01',
        timePeriod: 'pm',
        timeRange: '01:00 – 03:00 WIB',
        title: 'Operating Systems',
        room: 'Lab 2',
        lecturer: 'Prof. Wolfgang Grimmer',
        duration: '2 Hours',
        headerColor: '#3B3878',
        cardColor: '#6560B0',
      },
    ],
  },
  {
    dayName: 'Tue',
    dayNumber: '12',
    items: [
      {
        id: 'tue_1',
        time: '10',
        timePeriod: 'am',
        timeRange: '10:00 – 12:00 WIB',
        title: 'Database Management',
        room: 'B204',
        lecturer: 'Ms. Anna Liebert',
        duration: '2 Hours',
        headerColor: '#2E7958',
        cardColor: '#57B288',
      },
      {
        id: 'tue_2',
        time: '03',
        timePeriod: 'pm',
        timeRange: '03:00 – 04:30 WIB',
        title: 'Software Engineering',
        room: 'A302',
        lecturer: 'Dr. Heinrich Lunge',
        duration: '1.5 Hours',
        headerColor: '#783E28',
        cardColor: '#B0694E',
      },
    ],
  },
  {
    dayName: 'Wed',
    dayNumber: '13',
    items: [
      {
        id: 'wed_1',
        time: '09',
        timePeriod: 'am',
        timeRange: '09:00 – 12:00 WIB',
        title: 'Web Application Development',
        room: 'Lab 1',
        lecturer: 'Mr. Roberto',
        duration: '3 Hours',
        headerColor: '#244872',
        cardColor: '#4C7BA8',
      },
    ],
  },
  {
    dayName: 'Thu',
    dayNumber: '14',
    items: [
      {
        id: 'thu_1',
        time: '08',
        timePeriod: 'am',
        timeRange: '08:00 – 10:00 WIB',
        title: 'Computer Network',
        room: 'B103',
        lecturer: 'Mr. John Liebert',
        duration: '2 Hours',
        headerColor: '#2E7979',
        cardColor: '#5FB8B2',
      },
      {
        id: 'thu_2',
        time: '04',
        timePeriod: 'pm',
        timeRange: '04:00 – 05:30 WIB',
        title: 'Discrete Mathematics',
        room: 'B209',
        lecturer: 'Ms. Enami Asa',
        duration: '1.5 Hours',
        headerColor: '#274975',
        cardColor: '#4D7FA9',
      },
    ],
  },
  {
    dayName: 'Fri',
    dayNumber: '15',
    items: [
      {
        id: 'fri_1',
        time: '08',
        timePeriod: 'am',
        timeRange: '08:00 – 10:00 WIB',
        title: 'Artificial Intelligence',
        room: 'B301',
        lecturer: 'Dr. Kenzo Tenma',
        duration: '2 Hours',
        headerColor: '#4C2A78',
        cardColor: '#7E54B0',
      },
      {
        id: 'fri_2',
        time: '02',
        timePeriod: 'pm',
        timeRange: '02:00 – 04:00 WIB',
        title: 'Cyber Security Basics',
        room: 'Lab 3',
        lecturer: 'Mr. John Liebert',
        duration: '2 Hours',
        headerColor: '#2A6868',
        cardColor: '#4EA3A3',
      },
    ],
  },
  {
    dayName: 'Sat',
    dayNumber: '16',
    items: [
      {
        id: 'sat_1',
        time: '10',
        timePeriod: 'am',
        timeRange: '10:00 – 01:00 WIB',
        title: 'Workshop Cloud Computing',
        room: 'Auditorium',
        lecturer: 'Guest Speaker',
        duration: '3 Hours',
        headerColor: '#755127',
        cardColor: '#A87D4C',
      },
    ],
  },
  {
    dayName: 'Sun',
    dayNumber: '17',
    items: [],
  },
];
