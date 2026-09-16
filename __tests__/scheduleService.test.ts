import { scheduleService } from '../src/services/scheduleService';

describe('ScheduleService Unit Tests', () => {
  test('should return initial week schedule with 7 days', () => {
    const week = scheduleService.getWeekSchedule();
    expect(week).toHaveLength(7);
    expect(week[0].dayName).toBe('Sen');
    expect(week[3].dayName).toBe('Kam');
  });

  test('should retrieve first lesson for home screen', () => {
    const firstLesson = scheduleService.getFirstLesson();
    expect(firstLesson).not.toBeNull();
    expect(firstLesson?.title).toBeDefined();
    expect(firstLesson?.room).toBeDefined();
  });

  test('should update selected month and year', () => {
    scheduleService.setSelectedMonthYear('September, 2026');
    expect(scheduleService.getSelectedMonthYear()).toBe('September, 2026');

    // Reset back
    scheduleService.setSelectedMonthYear('Juni, 2026');
    expect(scheduleService.getSelectedMonthYear()).toBe('Juni, 2026');
  });

  test('should add new schedule item successfully', () => {
    const listener = jest.fn();
    const unsub = scheduleService.subscribe(listener);

    const newItem = scheduleService.addScheduleItem({
      dayIndex: 0, // Senin
      title: 'Machine Learning',
      lecturer: 'Prof. Hinton',
      room: 'Lab AI',
      time: '07',
      timePeriod: 'am',
      duration: '3 Jam',
      timeRange: '07:00 WIB - 10:00 WIB',
    });

    expect(newItem.id).toBeDefined();
    expect(newItem.title).toBe('Machine Learning');
    expect(listener).toHaveBeenCalled();

    const week = scheduleService.getWeekSchedule();
    const mondayItems = week[0].items;
    const found = mondayItems.find((it) => it.id === newItem.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Machine Learning');

    unsub();
  });

  test('should update existing schedule item', () => {
    const week = scheduleService.getWeekSchedule();
    const target = week[0].items[0];

    const updated = scheduleService.updateScheduleItem({
      dayIndex: 0,
      itemId: target.id,
      room: 'Ruang Baru 101',
      duration: '4 Jam',
    });

    expect(updated).toBe(true);

    const newWeek = scheduleService.getWeekSchedule();
    const updatedItem = newWeek[0].items.find((it) => it.id === target.id);
    expect(updatedItem?.room).toBe('Ruang Baru 101');
    expect(updatedItem?.duration).toBe('4 Jam');
  });

  test('should delete schedule item', () => {
    const week = scheduleService.getWeekSchedule();
    const target = week[0].items[0];
    const initialCount = week[0].items.length;

    const deleted = scheduleService.deleteScheduleItem(0, target.id);
    expect(deleted).toBe(true);

    const newWeek = scheduleService.getWeekSchedule();
    expect(newWeek[0].items.length).toBe(initialCount - 1);
  });

  test('should notify subscribers on day index change', () => {
    const listener = jest.fn();
    const unsub = scheduleService.subscribe(listener);

    scheduleService.setSelectedDayIndex(1);
    expect(scheduleService.getSelectedDayIndex()).toBe(1);
    expect(listener).toHaveBeenCalled();

    unsub();
  });
});
