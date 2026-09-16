import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { notificationService } from '../../services/notificationService';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const platformLabel =
    Platform.OS === 'ios'
      ? 'iOS Notification Center'
      : Platform.OS === 'android'
      ? 'Android Notification Drawer'
      : Platform.OS === 'web'
      ? typeof window !== 'undefined' && window.electronAPI?.isElectron
        ? 'Desktop Native Notification Center'
        : 'Browser / Desktop Action Center'
      : 'Device Notification Center';

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Jadwal Kuliah Mendatang 📚',
      description: 'Kelas Informatics dimulai pukul 08:00 WIB di Ruang B103.',
      time: '10 menit lalu',
      iconName: 'calendar',
      iconColor: Colors.cardHeaderTeal,
    },
    {
      id: '2',
      title: 'Status Keuangan Mahasiswa 💸',
      description: 'Pengeluaran bulan ini tercatat dan saldo aktif tersinkronisasi.',
      time: '1 jam lalu',
      iconName: 'wallet',
      iconColor: Colors.accentYellow,
    },
    {
      id: '3',
      title: 'Promo Spesial UMKM 🍛',
      description: 'Kokoes Bites memberikan promo hemat menu dessert 15K.',
      time: '3 jam lalu',
      iconName: 'storefront',
      iconColor: Colors.badgeRed,
    },
    {
      id: '4',
      title: 'Aplikasi Berhasil Terpasang 🎉',
      description: 'Selamat datang di CampusLife! Notifikasi sistem telah aktif.',
      time: 'Hari ini',
      iconName: 'checkmark-circle',
      iconColor: '#22C55E',
    },
  ];

  const triggerNotification = async (title: string, body: string) => {
    setIsSending(true);
    setFeedbackMessage(null);
    try {
      const success = await notificationService.sendNotification({
        title,
        body,
        data: { timestamp: Date.now() },
      });

      if (success) {
        setFeedbackMessage(`Notifikasi terkirim ke ${platformLabel}!`);
      } else {
        setFeedbackMessage('Izin notifikasi belum aktif atau diblokir.');
      }
    } catch (err) {
      setFeedbackMessage('Gagal mengirim notifikasi.');
    } finally {
      setIsSending(false);
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
    }
  };

  const handleSendTest = () => {
    triggerNotification(
      'CampusLife Notification Center 🔔',
      'Halo Salman! Notifikasi ini berhasil muncul di Notification Center device Anda.'
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={Colors.accentYellow} />
              <Text style={styles.titleText}>Notifikasi Kampus</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          {/* Device Platform Badge */}
          <View style={styles.platformBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.platformBadgeText}>
              Terhubung ke: <Text style={styles.platformHighlight}>{platformLabel}</Text>
            </Text>
          </View>

          {/* Test Push Button */}
          <Pressable
            style={[styles.testButton, isSending && styles.testButtonDisabled]}
            onPress={handleSendTest}
            disabled={isSending}
          >
            <Ionicons name="paper-plane" size={16} color="#000000" />
            <Text style={styles.testButtonText}>
              {isSending ? 'Mengirim...' : 'Tes Munculkan di Notification Center'}
            </Text>
          </Pressable>

          {feedbackMessage && (
            <View style={styles.feedbackBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          <Text style={styles.hintText}>
            Ketuk salah satu notifikasi untuk memunculkannya di sistem device:
          </Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.notificationItem,
                  pressed && styles.notificationItemPressed,
                ]}
                onPress={() => triggerNotification(item.title, item.description)}
              >
                <View style={[styles.iconBox, { backgroundColor: item.iconColor + '20' }]}>
                  <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                </View>
                <View style={styles.itemTextContainer}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Ionicons name="arrow-redo-outline" size={14} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.footerBtn} onPress={onClose}>
            <Text style={styles.footerBtnText}>Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#10172A',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  closeBtn: {
    padding: 4,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  platformBadgeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  platformHighlight: {
    color: Colors.accentYellow,
    fontWeight: '700',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentYellow,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  feedbackText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  listContainer: {
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    alignItems: 'flex-start',
  },
  notificationItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  itemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 17,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  footerBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});