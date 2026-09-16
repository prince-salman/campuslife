import { notificationService } from '../src/services/notificationService';

describe('NotificationService Unit Tests', () => {
  beforeEach(() => {
    // Reset window mock state if needed
    delete (global as any).window;
  });

  test('should handle web environment with window.electronAPI gracefully', async () => {
    const mockSend = jest.fn().mockResolvedValue(true);
    (global as any).window = {
      electronAPI: {
        isElectron: true,
        sendNotification: mockSend,
      },
    };

    const inited = await notificationService.init();
    expect(inited).toBe(true);

    const sent = await notificationService.sendNotification({
      title: 'Uji Notifikasi Windows/macOS',
      body: 'Pesan uji coba',
    });

    expect(sent).toBe(true);
    expect(mockSend).toHaveBeenCalledWith({
      title: 'Uji Notifikasi Windows/macOS',
      body: 'Pesan uji coba',
    });
  });

  test('should handle web environment with HTML5 Notification API', async () => {
    const mockNotificationConstructor = jest.fn();
    (global as any).window = {
      Notification: Object.assign(mockNotificationConstructor, {
        permission: 'granted',
        requestPermission: jest.fn().mockResolvedValue('granted'),
      }),
    };

    const sent = await notificationService.sendNotification({
      title: 'Web Push Notif',
      body: 'Isi notifikasi',
    });

    expect(sent).toBe(true);
  });

  test('should format class reminder correctly', async () => {
    const mockSend = jest.fn().mockResolvedValue(true);
    (global as any).window = {
      electronAPI: {
        isElectron: true,
        sendNotification: mockSend,
      },
    };

    const res = await notificationService.sendClassReminder('Informatics', '08:00 WIB', 'B103');
    expect(res).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Jadwal Kuliah Mendatang'),
        body: expect.stringContaining('Informatics'),
      })
    );
  });

  test('should format transaction alert correctly for income and expense', async () => {
    const mockSend = jest.fn().mockResolvedValue(true);
    (global as any).window = {
      electronAPI: {
        isElectron: true,
        sendNotification: mockSend,
      },
    };

    // Income
    await notificationService.sendTransactionAlert('Gaji Magang', 'Rp 1.500.000', 'income');
    expect(mockSend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Pemasukan Dicatat'),
        body: expect.stringContaining('+Rp 1.500.000'),
      })
    );

    // Expense
    await notificationService.sendTransactionAlert('Makan Siang', 'Rp 25.000', 'expense');
    expect(mockSend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Pengeluaran Dicatat'),
        body: expect.stringContaining('-Rp 25.000'),
      })
    );
  });

  test('should schedule upcoming class reminder before class starts', async () => {
    const res = await notificationService.scheduleUpcomingClassReminder(
      'Mobile Programming',
      'B103',
      '08:00 WIB',
      15
    );
    expect(res.scheduled).toBe(true);
    expect(res.message).toBeDefined();
  });

  test('should trigger delayed lockscreen test', async () => {
    (global as any).window = {
      electronAPI: {
        isElectron: true,
        sendNotification: jest.fn().mockResolvedValue(true),
      },
    };

    const res = await notificationService.sendDelayedLockscreenTest(1);
    expect(res).toBe(true);
  });
});
