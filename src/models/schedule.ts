export interface ScheduleItem {
  id: string;
  time: string;
  timePeriod: string;
  timeRange?: string;
  title: string;
  room: string;
  lecturer: string;
  duration: string;
  endTime?: string;
  reminderMinutes?: number;
  headerColor: string;
  cardColor: string;
}

export interface DaySchedule {
  dayName: string;
  dayNumber: string;
  items: ScheduleItem[];
}