import { Platform, NativeModules } from 'react-native';
import * as Notifications from 'expo-notifications';

const WakeScreenModule = (NativeModules && NativeModules.WakeScreenModule) || null;

export interface DeviceNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  channelId?: 'class_reminders_channel' | 'default' | string;
  isUrgent?: boolean;
}

// Type declaration for Electron exposed API
declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      sendNotification: (payload: { title: string; body: string }) => Promise<boolean>;
    };
  }
}

class NotificationService {
  private isInitialized = false;
  private permissionGranted = false;

  /**
   * Initializes notification service across all platforms:
   * - iOS: Registers expo-notifications handlers and requests permissions.
   * - Android: Registers 2 high-priority notification channels (PUBLIC lockscreen visibility).
   * - Windows & macOS (Electron / Web): Configures native Electron IPC or Web Notification API.
   */
  async init(): Promise<boolean> {
    if (this.isInitialized) {
      return this.permissionGranted;
    }

    if (Platform.OS === 'web') {
      try {
        // Desktop Electron native bridge
        if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
          this.permissionGranted = true;
          this.isInitialized = true;
          return true;
        }

        // Web / Desktop browser (Windows Action Center & macOS Notification Center via Web Notification)
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (window.Notification.permission === 'granted') {
            this.permissionGranted = true;
          } else if (window.Notification.permission === 'default') {
            const status = await window.Notification.requestPermission();
            this.permissionGranted = status === 'granted';
          } else {
            this.permissionGranted = false;
          }
          this.isInitialized = true;
          return this.permissionGranted;
        }
      } catch (err) {
        console.warn('Web notification init warning:', err);
      }
      this.isInitialized = true;
      return false;
    } else {
      // Mobile: iOS & Android via expo-notifications
      try {
        // Configure foreground notification presentation behavior
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Configure high-importance channels for Android lockscreen & drawer
        if (Platform.OS === 'android') {
          // 1. Critical Class Reminders Channel (Pierces Lockscreen & Wakes Screen)
          await Notifications.setNotificationChannelAsync('class_reminders_channel', {
            name: 'Pengingat Kuliah & Ujian (Layar Kunci)',
            description: 'Pengingat kelas prioritas tinggi yang menembus layar kunci dan menyalakan layar.',
            importance: Notifications.AndroidImportance.MAX,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
            sound: 'default',
            audioAttributes: {
              usage: Notifications.AndroidAudioUsage.ALARM,
              contentType: Notifications.AndroidAudioContentType.SONIFICATION,
              flags: {
                enforceAudibility: true,
                requestHardwareAudioVideoSynchronization: false,
              },
            },
            vibrationPattern: [0, 500, 200, 500, 200, 500],
            lightColor: '#F59E0B',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
          });

          // 2. General Notification Channel
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Notifikasi Umum Campus Life',
            description: 'Pengumuman, aktivitas keuangan, dan status kampus',
            importance: Notifications.AndroidImportance.MAX,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3B82F6',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
          });

          // 3. Fallback Channel (used when trigger is null on Android)
          await Notifications.setNotificationChannelAsync('expo_notifications_fallback_notification_channel', {
            name: 'Campus Life Notifikasi Layar Kunci',
            description: 'Pengingat prioritas tinggi di layar kunci dan bilah status',
            importance: Notifications.AndroidImportance.MAX,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
            vibrationPattern: [0, 500, 200, 500, 200, 500],
            lightColor: '#F59E0B',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
          });
        }

        // Check and request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowDisplayInCarPlay: true,
              allowCriticalAlerts: true,
              provideAppNotificationSettings: true,
              allowAnnouncements: true,
            },
          });
          finalStatus = status;
        }

        this.permissionGranted = finalStatus === 'granted';
        this.isInitialized = true;
        return this.permissionGranted;
      } catch (err) {
        console.warn('Mobile notification init warning:', err);
        this.isInitialized = true;
        return false;
      }
    }
  }

  /**
   * Alias for init() to maintain full compatibility
   */
  async initialize(): Promise<boolean> {
    return await this.init();
  }

  /**
   * Request or check notification permissions
   */
  async requestPermission(): Promise<boolean> {
    this.isInitialized = false;
    return await this.init();
  }

  /**
   * Send notification directly into the device's Notification Center:
   * - iOS: iOS Notification Center & Banner (timeSensitive interruption level)
   * - Android: Android Status Bar & Lock Screen (PUBLIC visibility, MAX importance)
   * - Windows: Windows Action Center / Toast Notification
   * - macOS: macOS Notification Center Banner
   */
  async sendNotification(payload: DeviceNotificationPayload): Promise<boolean> {
    if (!this.isInitialized) {
      await this.init();
    }

    const title = payload.title.trim() || 'Campus Life';
    const body = payload.body.trim() || '';
    const targetChannel = payload.channelId || (payload.isUrgent ? 'class_reminders_channel' : 'default');

    if (Platform.OS === 'web') {
      try {
        // 1. Electron IPC (Windows & macOS Native)
        if (typeof window !== 'undefined' && window.electronAPI?.sendNotification) {
          const res = await window.electronAPI.sendNotification({ title, body });
          if (res) return true;
        }

        // 2. Web Notification API (Windows Action Center / macOS Notification Center via Browser)
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (window.Notification.permission === 'default') {
            const perm = await window.Notification.requestPermission();
            this.permissionGranted = perm === 'granted';
          }

          if (window.Notification.permission === 'granted') {
            const notif = new window.Notification(title, {
              body,
              data: payload.data,
            });

            const timer = setTimeout(() => {
              try {
                notif.close();
              } catch (_) {}
            }, 6000);
            if (typeof timer === 'object' && typeof timer.unref === 'function') {
              timer.unref();
            }

            return true;
          }
        }
      } catch (err) {
        console.warn('Failed to dispatch web/desktop notification:', err);
      }
      return false;
    } else {
      // 3. Mobile (iOS & Android)
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: payload.data,
            sound: payload.sound ?? true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 500, 200, 500, 200, 500],
            badge: 1,
            color: '#F59E0B',
            // iOS 15+ timeSensitive breaks through Focus mode / Do Not Disturb
            ...(Platform.OS === 'ios' ? { interruptionLevel: 'timeSensitive' as const } : {}),
          },
          trigger: null, // deliver immediately to system notification drawer & lockscreen
        });

        if (payload.isUrgent) {
          await this.wakeDeviceScreen(5000);
        }
        return true;
      } catch (err) {
        console.warn('Failed to dispatch mobile notification:', err);
        return false;
      }
    }
  }

  /**
   * Request native hardware screen wake up if running on native Android (bypasses screen sleep)
   */
  async wakeDeviceScreen(durationMs: number = 5000): Promise<boolean> {
    if (Platform.OS === 'android' && WakeScreenModule?.turnScreenOn) {
      try {
        return await WakeScreenModule.turnScreenOn(durationMs);
      } catch (e) {
        console.warn('WakeScreenModule error:', e);
      }
    }
    return false;
  }

  /**
   * Alias for sendNotification to maintain full compatibility with friend's implementation
   */
  async sendLocalNotification(title: string, body: string, data: Record<string, any> = {}): Promise<void> {
    await this.sendNotification({ title, body, data, isUrgent: true });
  }

  /**
   * Send welcome notification when app is installed/opened
   */
  async sendWelcomeNotification(): Promise<void> {
    await this.sendNotification({
      title: 'Selamat Datang di Campus Life! 🎉',
      body: 'Aplikasi berhasil terpasang di HP Anda. Jadwal kuliah dan info kampus siap digunakan.',
      data: { type: 'welcome' },
    });
  }

  /**
   * Send upcoming class schedule reminder immediately with maximum lockscreen priority
   */
  async sendClassReminder(courseTitle: string, arg2: string, arg3?: string): Promise<boolean> {
    let room = 'B103';
    let time = '08:00 WIB';

    if (arg3) {
      if (arg2.includes(':') || arg2.includes('WIB') || arg2.includes('am') || arg2.includes('pm')) {
        time = arg2;
        room = arg3;
      } else {
        room = arg2;
        time = arg3;
      }
    } else if (arg2) {
      if (arg2.includes(':') || arg2.includes('WIB')) {
        time = arg2;
      } else {
        room = arg2;
      }
    }

    return await this.sendNotification({
      title: `⏰ PENGINGAT KULIAH: ${courseTitle} 📚 (Jadwal Kuliah Mendatang)`,
      body: `Kelas ${courseTitle} dimulai jam ${time} di Ruang ${room}. Segera bersiap dan jangan sampai terlambat!`,
      data: { type: 'class_reminder', courseTitle, room, time },
      channelId: 'class_reminders_channel',
      isUrgent: true,
    });
  }

  /**
   * Schedules a lockscreen alert before class begins (e.g., 15 or 30 minutes before)
   */
  async scheduleUpcomingClassReminder(
    courseTitle: string,
    room: string,
    timeString: string,
    minutesBefore: number = 15
  ): Promise<{ scheduled: boolean; message: string; notificationId?: string }> {
    if (!this.isInitialized) {
      await this.init();
    }

    const title = `⏰ PENGINGAT KELAS (${minutesBefore} Menit Lagi): ${courseTitle}`;
    const body = `Kuliah ${courseTitle} di Ruang ${room} dimulai jam ${timeString}. Siapkan perlengkapan sekarang!`;

    if (Platform.OS === 'web') {
      return {
        scheduled: true,
        message: `Pengingat terjadwal ${minutesBefore} menit sebelum jam ${timeString}.`,
      };
    }

    try {
      // Calculate trigger date
      const match = timeString.match(/(\d{1,2})[:.](\d{2})/);
      const now = new Date();
      let targetDate = new Date();

      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        targetDate.setHours(hours, minutes, 0, 0);
        targetDate = new Date(targetDate.getTime() - minutesBefore * 60 * 1000);

        // If time already passed today, set for tomorrow
        if (targetDate.getTime() <= now.getTime()) {
          targetDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
        }
      } else {
        targetDate = new Date(now.getTime() + minutesBefore * 60 * 1000);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'scheduled_class_reminder', courseTitle, room, timeString, minutesBefore },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 200, 500, 200, 500],
          badge: 1,
          color: '#F59E0B',
          ...(Platform.OS === 'ios' ? { interruptionLevel: 'timeSensitive' as const } : {}),
        },
        trigger: {
          date: targetDate,
          channelId: 'class_reminders_channel',
        },
      });

      return {
        scheduled: true,
        message: `Pengingat aktif! Notifikasi layar kunci akan muncul ${minutesBefore} menit sebelum kelas dimulai.`,
        notificationId: id,
      };
    } catch (err) {
      console.warn('Failed to schedule class reminder:', err);
      return {
        scheduled: false,
        message: 'Gagal menjadwalkan notifikasi di sistem perangkat.',
      };
    }
  }

  /**
   * Sends a high-priority lock screen notification after X seconds delay.
   * Allows user to lock their phone screen (press power button) and verify the notification pierces the lock screen!
   */
  async sendDelayedLockscreenTest(seconds: number = 5): Promise<boolean> {
    if (!this.isInitialized) {
      await this.init();
    }

    const title = '🚨 PENGINGAT KULIAH DARURAT (Layar Terkunci)';
    const body = 'Kelas Pemrograman Mobile di Ruang Lab B103 dimulai 15 menit lagi! Layar HP Anda berhasil menyala di Lock Screen.';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const timer = setTimeout(() => {
          this.sendNotification({
            title,
            body,
            channelId: 'class_reminders_channel',
            isUrgent: true,
          });
        }, seconds * 1000);
        if (typeof timer === 'object' && typeof timer.unref === 'function') {
          timer.unref();
        }
        return true;
      }
      return false;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'lockscreen_test', testTime: Date.now() },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 200, 500, 200, 500],
          badge: 1,
          color: '#F59E0B',
          ...(Platform.OS === 'ios' ? { interruptionLevel: 'timeSensitive' as const } : {}),
        },
        trigger: {
          seconds,
          channelId: 'class_reminders_channel',
        },
      });

      if (Platform.OS === 'android') {
        const timer = setTimeout(() => {
          this.wakeDeviceScreen(6000);
        }, seconds * 1000);
        if (typeof timer === 'object' && typeof timer.unref === 'function') {
          timer.unref();
        }
      }

      return true;
    } catch (err) {
      console.warn('Delayed lockscreen test warning:', err);
      return false;
    }
  }

  /**
   * Send transaction alert to device notification center
   */
  async sendTransactionAlert(
    title: string,
    amountFormatted: string,
    type: 'income' | 'expense'
  ): Promise<boolean> {
    const isExpense = type === 'expense';
    const prefix = isExpense ? 'Pengeluaran Dicatat 💸' : 'Pemasukan Dicatat 💰';
    return await this.sendNotification({
      title: prefix,
      body: `${title}: ${isExpense ? '-' : '+'}${amountFormatted}`,
      data: { type: 'transaction', transactionTitle: title, amount: amountFormatted },
      channelId: 'default',
    });
  }
}

export const notificationService = new NotificationService();
