import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface DeviceNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
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
   * - Android: Registers notification channel with MAX priority and requests permissions.
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
        // Configure foreground notification behavior
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Configure high-importance channel for Android notification drawer
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Campus Life Notifikasi',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F59E0B',
            enableLights: true,
            enableVibrate: true,
          });
        }

        // Check and request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
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
   * Request or check notification permissions
   */
  async requestPermission(): Promise<boolean> {
    this.isInitialized = false;
    return await this.init();
  }

  /**
   * Send notification directly into the device's Notification Center:
   * - iOS: iOS Notification Center & Banner
   * - Android: Android Status Bar & Notification Drawer
   * - Windows: Windows Action Center / Toast Notification
   * - macOS: macOS Notification Center Banner
   */
  async sendNotification(payload: DeviceNotificationPayload): Promise<boolean> {
    // Ensure initialized
    if (!this.isInitialized) {
      await this.init();
    }

    const title = payload.title.trim() || 'Campus Life';
    const body = payload.body.trim() || '';

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

            // Auto-close after 6 seconds if supported
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
          },
          trigger: null, // deliver immediately to Notification Center
        });
        return true;
      } catch (err) {
        console.warn('Failed to dispatch mobile notification:', err);
        return false;
      }
    }
  }

  /**
   * Send upcoming class schedule reminder
   */
  async sendClassReminder(lessonTitle: string, time: string, room: string): Promise<boolean> {
    return await this.sendNotification({
      title: 'Jadwal Kuliah Mendatang 📚',
      body: `Kelas ${lessonTitle} akan dimulai pukul ${time} di Ruang ${room}. Jangan sampai terlambat!`,
      data: { type: 'schedule', lessonTitle, time, room },
    });
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
    });
  }
}

export const notificationService = new NotificationService();
