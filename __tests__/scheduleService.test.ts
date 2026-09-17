import { scheduleService, ScheduleService } from '../src/services/scheduleService';

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

  test('should correctly calculate end time and time range automatically', () => {
    // 08:00 AM + 2 Jam -> 10:00 WIB
    const res1 = ScheduleService.calculateEndTime('08', 'am', '2 Jam');
    expect(res1.endTime).toBe('10:00 WIB');
    expect(res1.timeRange).toBe('08:00 WIB - 10:00 WIB');

    // 01:30 PM + 2.5 Jam -> 16:00 WIB
    const res2 = ScheduleService.calculateEndTime('01:30', 'pm', '2.5 Jam');
    expect(res2.endTime).toBe('16:00 WIB');
    expect(res2.timeRange).toBe('13:30 WIB - 16:00 WIB');

    // 11:00 AM + 90 Menit -> 12:30 WIB
    const res3 = ScheduleService.calculateEndTime('11:00', 'am', '90 Menit');
    expect(res3.endTime).toBe('12:30 WIB');
  });

  test('should reset calendar to current device date and month', () => {
    scheduleService.resetToCurrentDeviceDate();
    const monthYear = scheduleService.getSelectedMonthYear();
    const currentYear = new Date().getFullYear();
    expect(monthYear).toContain(String(currentYear));

    const selectedIndex = scheduleService.getSelectedDayIndex();
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThanOrEqual(6);
  });

  describe('Per-User Schedule Privacy & Isolation', () => {
    test('new user starts with clean empty schedule on all days', async () => {
      await scheduleService.setUserId('new_student_schedule_user_1');
      const week = scheduleService.getWeekSchedule();
      expect(week).toHaveLength(7);
      for (const day of week) {
        expect(day.items).toEqual([]);
      }
      expect(scheduleService.getFirstLesson()).toBeNull();
    });

    test('schedule added by User A is completely isolated and not visible to User B', async () => {
      // 1. User A adds a class
      await scheduleService.setUserId('user_charlie_111');
      const charlieWeekBefore = scheduleService.getWeekSchedule();
      expect(charlieWeekBefore[0].items).toHaveLength(0);

      scheduleService.addScheduleItem({
        dayIndex: 0,
        title: 'Cyber Security Ethics',
        lecturer: 'Dr. John',
        room: 'Lab 4',
        time: '08',
        timePeriod: 'am',
        duration: '2 Jam',
      });

      const charlieWeekAfter = scheduleService.getWeekSchedule();
      expect(charlieWeekAfter[0].items).toHaveLength(1);
      expect(charlieWeekAfter[0].items[0].title).toBe('Cyber Security Ethics');

      // 2. Switch to User B
      await scheduleService.setUserId('user_diana_222');
      const dianaWeek = scheduleService.getWeekSchedule();
      expect(dianaWeek[0].items).toHaveLength(0);
      expect(scheduleService.getFirstLesson()).toBeNull();

      // 3. Switch back to User A
      await scheduleService.setUserId('user_charlie_111');
      const charlieWeekReload = scheduleService.getWeekSchedule();
      expect(charlieWeekReload[0].items).toHaveLength(1);
      expect(charlieWeekReload[0].items[0].title).toBe('Cyber Security Ethics');
    });

    test('demo student account preserves test schedule classes', async () => {
      await scheduleService.setUserId('3b52c06a-1539-4c17-8df3-f534d6651909');
      const demoWeek = scheduleService.getWeekSchedule();
      expect(demoWeek).toHaveLength(7);
      const totalItems = demoWeek.reduce((sum, d) => sum + d.items.length, 0);
      expect(totalItems).toBeGreaterThan(0);
    });
  });
});
