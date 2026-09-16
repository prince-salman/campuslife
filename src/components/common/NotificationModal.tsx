import React, { useState, useEffect } from 'react';
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
  isUrgent?: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Countdown timer effect for Lock Screen testing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockCountdown !== null && lockCountdown > 0) {
      timer = setTimeout(() => {
        setLockCountdown(lockCountdown - 1);
      }, 1000);
    } else if (lockCountdown === 0) {
      setLockCountdown(null);
      setFeedbackMessage('Notifikasi layar kunci telah dikirim! Periksa layar HP Anda.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [lockCountdown]);

  const platformLabel =
    Platform.OS === 'ios'
      ? 'iOS Lock Screen & Notification Center'
      : Platform.OS === 'android'
      ? 'Android Lock Screen & Notification Drawer'
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
      isUrgent: true,
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

  const triggerNotification = async (title: string, body: string, isUrgent = false) => {
    setIsSending(true);
    setFeedbackMessage(null);
    try {
      const success = await notificationService.sendNotification({
        title,
        body,
        isUrgent,
        channelId: isUrgent ? 'class_reminders_channel' : 'default',
        data: { timestamp: Date.now() },
      });

      if (success) {
        setFeedbackMessage(`Notifikasi terkirim ke ${platformLabel}!`);
      } else {
        setFeedbackMessage('Izin notifikasi belum aktif atau diblokir sistem HP.');
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

  const handleSendInstantTest = () => {
    triggerNotification(
      'CampusLife Notification Center 🔔',
      'Halo Salman! Notifikasi ini berhasil muncul dengan prioritas tinggi di layar HP Anda.',
      true
    );
  };

  const handleLockscreenTest = async () => {
    setLockCountdown(5);
    setFeedbackMessage('⏰ Hitung mundur 5 detik! Segera tekan tombol POWER untuk mengunci layar HP.');
    await notificationService.sendDelayedLockscreenTest(5);
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
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={Colors.accentYellow} />
              <Text style={styles.titleText}>Notifikasi Kampus</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          {/* Device Platform & Lockscreen Status Badge */}
          <View style={styles.platformBadge}>
            <View style={styles.activeDot} />
            <View style={styles.badgeTextCol}>
              <Text style={styles.platformBadgeText}>
                Target: <Text style={styles.platformHighlight}>{platformLabel}</Text>
              </Text>
              <Text style={styles.lockscreenStatusText}>
                Prioritas Maksimal • Tembus Lock Screen Aktif
              </Text>
            </View>
          </View>

          {/* Lock Screen Test Button (Urgent Breakthrough Feature) */}
          <Pressable
            style={[
              styles.lockTestButton,
              lockCountdown !== null && styles.lockTestButtonActive,
            ]}
            onPress={handleLockscreenTest}
            disabled={lockCountdown !== null}
          >
            <Ionicons
              name={lockCountdown !== null ? 'hourglass' : 'lock-closed'}
              size={18}
              color="#000000"
            />
            <Text style={styles.lockTestButtonText}>
              {lockCountdown !== null
                ? `KUNCI HP SEKARANG (${lockCountdown}s...)`
                : 'Tes Tembus Layar Terkunci (Hitung Mundur 5s)'}
            </Text>
          </Pressable>

          {/* Instant Test Button */}
          <Pressable
            style={[styles.testButton, isSending && styles.testButtonDisabled]}
            onPress={handleSendInstantTest}
            disabled={isSending || lockCountdown !== null}
          >
            <Ionicons name="paper-plane" size={15} color={Colors.textWhite} />
            <Text style={styles.testButtonText}>
              {isSending ? 'Mengirim...' : 'Tes Munculkan Notifikasi Instan'}
            </Text>
          </Pressable>

          {/* Feedback message banner */}
          {feedbackMessage && (
            <View
              style={[
                styles.feedbackBanner,
                lockCountdown !== null && styles.feedbackBannerWarning,
              ]}
            >
              <Ionicons
                name={lockCountdown !== null ? 'alert-circle' : 'checkmark-circle'}
                size={16}
                color={lockCountdown !== null ? '#F59E0B' : '#22C55E'}
              />
              <Text
                style={[
                  styles.feedbackText,
                  lockCountdown !== null && styles.feedbackTextWarning,
                ]}
              >
                {feedbackMessage}
              </Text>
            </View>
          )}

          {/* Guide Toggle */}
          <Pressable
            style={styles.guideToggle}
            onPress={() => setShowGuide(!showGuide)}
          >
            <Ionicons
              name={showGuide ? 'chevron-up' : 'information-circle-outline'}
              size={15}
              color={Colors.accentYellow}
            />
            <Text style={styles.guideToggleText}>
              {showGuide
                ? 'Sembunyikan Tips Pengaturan HP'
                : 'Tips Agar Notifikasi Selalu Tembus di HP (Samsung, Xiaomi, Oppo)'}
            </Text>
          </Pressable>

          {/* Student Lock Screen Guide Content */}
          {showGuide && (
            <View style={styles.guideBox}>
              <Text style={styles.guideTitle}>
                Agar HP Mahasiswa Tidak Menyembunyikan Pengingat:
              </Text>
              <Text style={styles.guideItem}>
                • <Text style={styles.guideBold}>Notifikasi Layar Kunci</Text>: Buka Pengaturan HP &gt; Notifikasi &gt; Layar Kunci &gt; pilih "Tampilkan semua konten".
              </Text>
              <Text style={styles.guideItem}>
                • <Text style={styles.guideBold}>Penghemat Baterai</Text>: Atur aplikasi Campus Life ke "Tanpa Pembatasan" agar alarm kuliah tidak ditunda saat layar mati.
              </Text>
              <Text style={styles.guideItem}>
                • <Text style={styles.guideBold}>Popup Banner</Text>: Izinkan "Tampilkan banner melayang / Pop-up" untuk kelas darurat.
              </Text>
            </View>
          )}

          <Text style={styles.hintText}>
            Ketuk notifikasi untuk menguji pengiriman ke layar perangkat:
          </Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.notificationItem,
                  pressed && styles.notificationItemPressed,
                ]}
                onPress={() =>
                  triggerNotification(item.title, item.description, item.isUrgent)
                }
              >
                <View style={[styles.iconBox, { backgroundColor: item.iconColor + '20' }]}>
                  <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                </View>
                <View style={styles.itemTextContainer}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.isUrgent && (
                      <View style={styles.urgentTag}>
                        <Text style={styles.urgentTagText}>Prioritas</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemTime}>
                    {item.time} • Ketuk untuk kirim ke layar HP
                  </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentCard: {
    width: '100%',
    maxWidth: 490,
    backgroundColor: '#10172A',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#22C55E',
    marginTop: 3,
  },
  badgeTextCol: {
    flex: 1,
  },
  platformBadgeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  platformHighlight: {
    color: Colors.accentYellow,
    fontWeight: '700',
  },
  lockscreenStatusText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '600',
    marginTop: 2,
  },
  lockTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  lockTestButtonActive: {
    backgroundColor: '#EF4444',
  },
  lockTestButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
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
  feedbackBannerWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  feedbackText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  feedbackTextWarning: {
    color: '#F59E0B',
  },
  guideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 6,
  },
  guideToggleText: {
    fontSize: 11,
    color: Colors.accentYellow,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  guideBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  guideItem: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 15,
    marginBottom: 3,
  },
  guideBold: {
    color: Colors.accentYellow,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  listContainer: {
    marginBottom: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
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
    width: 38,
    height: 38,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  urgentTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  urgentTagText: {
    fontSize: 9,
    color: Colors.accentYellow,
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
    marginBottom: 3,
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