import React from 'react';
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

          {/* Mode Notifikasi Otomatis (Mengikuti Sistem HP) */}
          <View style={styles.deviceModeCard}>
            <View style={styles.deviceModeIconBox}>
              <Ionicons name="phone-portrait-outline" size={18} color={Colors.accentYellow} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deviceModeTitle}>Sinkronisasi Pengaturan HP</Text>
              <Text style={styles.deviceModeSub}>
                Notifikasi otomatis mengikuti profil suara, getar, atau Jangan Ganggu (DND) perangkat Anda.
              </Text>
            </View>
          </View>

          <Text style={styles.hintText}>Pemberitahuan Terkini</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <View key={item.id} style={styles.notificationItem}>
                <View style={[styles.iconBox, { backgroundColor: item.iconColor + '20' }]}>
                  <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                </View>
                <View style={styles.itemTextContainer}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.isUrgent && (
                      <View style={styles.urgentTag}>
                        <Text style={styles.urgentTagText}>Penting</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0A0F2C',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
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
  deviceModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  deviceModeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceModeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentYellow,
  },
  deviceModeSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    lineHeight: 15,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    flex: 1,
  },
  urgentTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginLeft: 6,
  },
  urgentTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  itemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  doneBtn: {
    backgroundColor: Colors.accentYellow,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
});
