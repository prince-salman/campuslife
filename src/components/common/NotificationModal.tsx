import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
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
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Jadwal Kuliah Mendatang',
      description: 'Kelas Informatics dimulai pukul 08:00 WIB di Ruang B103.',
      time: '10 menit lalu',
      iconName: 'calendar',
      iconColor: Colors.cardHeaderTeal,
    },
    {
      id: '2',
      title: 'Status Keuangan Mahasiswa',
      description: 'Pengeluaran bulan ini tercatat dan saldo aktif tersinkronisasi.',
      time: '1 jam lalu',
      iconName: 'wallet',
      iconColor: Colors.accentYellow,
    },
    {
      id: '3',
      title: 'Promo Spesial UMKM',
      description: 'Kokoes Bites memberikan promo hemat menu dessert 15K.',
      time: '3 jam lalu',
      iconName: 'storefront',
      iconColor: Colors.badgeRed,
    },
    {
      id: '4',
      title: 'Aplikasi Berhasil Terpasang',
      description: 'Selamat datang di CampusLife! Seluruh fitur siap digunakan.',
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
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={Colors.accentYellow} />
              <Text style={styles.titleText}>Notifikasi Kampus</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <View key={item.id} style={styles.notificationItem}>
                <View style={[styles.iconBox, { backgroundColor: item.iconColor + '20' }]}>
                  <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#10172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 2,
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
    backgroundColor: Colors.accentYellow,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});