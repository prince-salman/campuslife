import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Konfigurasi handler notifikasi agar tampil saat aplikasi terbuka (foreground) maupun background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private isInitialized = false;

  public async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Campus Life Notifikasi',
          description: 'Pengumuman dan pengingat jadwal kuliah Campus Life',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0C389E',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.isInitialized = finalStatus === 'granted';
      return this.isInitialized;
    } catch (error) {
      console.warn('Error initializing notification service:', error);
      return false;
    }
  }

  public async sendLocalNotification(title: string, body: string, data: Record<string, any> = {}): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }

    try {
      await this.initialize();

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Segera muncul di bilah status / layar kunci
      });
    } catch (error) {
      console.warn('Error sending local notification:', error);
    }
  }

  public async sendWelcomeNotification(): Promise<void> {
    await this.sendLocalNotification(
      'Selamat Datang di Campus Life!',
      'Aplikasi berhasil terpasang di HP Anda. Jadwal kuliah dan info kampus siap digunakan.',
      { type: 'welcome' }
    );
  }

  public async sendClassReminder(courseTitle: string, room: string, time: string): Promise<void> {
    await this.sendLocalNotification(
      'Pengingat Kuliah: ' + courseTitle,
      'Kelas dimulai jam ' + time + ' di ruang ' + room + '. Siapkan perlengkapan kuliah Anda.',
      { type: 'class_reminder', courseTitle, room, time }
    );
  }
}

export const notificationService = new NotificationService();
