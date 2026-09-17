import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { umkmService } from '../../services/umkmService';
import { adminUserService } from '../../services/adminUserService';
import { adService } from '../../services/adService';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 16);
  const { user, logout } = useAuth();

  const [umkmCount, setUmkmCount] = useState<number>(umkmService.getUmkmList().length);
  const [userCount, setUserCount] = useState<number>(adminUserService.getUsers().length);
  const [adCount, setAdCount] = useState<number>(adService.getAds().length);

  useEffect(() => {
    // Initial fetch from remote
    umkmService.fetchUmkmList().then((list) => setUmkmCount(list.length)).catch(() => {});
    adminUserService.fetchUsers().then((list) => setUserCount(list.length)).catch(() => {});

    const unsubUmkm = umkmService.subscribe(() => {
      setUmkmCount(umkmService.getUmkmList().length);
    });

    const unsubUser = adminUserService.subscribe(() => {
      setUserCount(adminUserService.getUsers().length);
    });

    const unsubAds = adService.subscribe(() => {
      setAdCount(adService.getAds().length);
    });

    return () => {
      unsubUmkm();
      unsubUser();
      unsubAds();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Admin Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.accentYellow} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Panel Administrator</Text>
            <Text style={styles.headerSub}>{user?.email || 'admin@campuslife.com'}</Text>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Supabase Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.statusTitle}>Supabase Real Data Engine</Text>
            <Text style={styles.statusSub}>Proyek: nepsoinveldfsncrgdvn.supabase.co</Text>
          </View>
          <Ionicons name="cloud-done-outline" size={20} color="#4ADE80" />
        </View>

        {/* Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { borderColor: '#55A4B2' }]}>
            <View style={styles.metricIconBox}>
              <Ionicons name="storefront" size={24} color="#55A4B2" />
            </View>
            <Text style={styles.metricValue}>{umkmCount}</Text>
            <Text style={styles.metricLabel}>Total UMKM Kampus</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: '#A380FF' }]}>
            <View style={styles.metricIconBox}>
              <Ionicons name="people" size={24} color="#A380FF" />
            </View>
            <Text style={styles.metricValue}>{userCount}</Text>
            <Text style={styles.metricLabel}>Pengguna Terdaftar</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: '#38BDF8' }]}>
            <View style={styles.metricIconBox}>
              <Ionicons name="megaphone" size={24} color="#38BDF8" />
            </View>
            <Text style={styles.metricValue}>{adCount}</Text>
            <Text style={styles.metricLabel}>Iklan Banner Aktif</Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={22} color={Colors.accentYellow} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.privacyTitle}>Kebijakan Privasi Mahasiswa</Text>
            <Text style={styles.privacyDesc}>
              Sesuai aturan keamanan data, menu **Jadwal Kuliah** dan **Keuangan Pribadi** tidak dapat diakses oleh akun Admin. Hanya pemilik akun yang dapat mengelola jadwal dan transaksinya.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>AKSI UTAMA ADMINISTRATOR</Text>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminAds')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#102A4A' }]}>
            <Ionicons name="megaphone" size={24} color="#38BDF8" />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.actionTitle}>Kelola Layanan Iklan & Promo</Text>
            <Text style={styles.actionDesc}>
              Atur kartu banner promosi (Laundry Express, Percetakan, dll) yang tampil di beranda mahasiswa.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminUmkm')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#1E3A3A' }]}>
            <Ionicons name="add-circle" size={24} color="#57B288" />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.actionTitle}>Kelola Katalog UMKM</Text>
            <Text style={styles.actionDesc}>
              Tambah UMKM baru, edit menu & harga, dan perbarui data yang dilihat seluruh mahasiswa.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminUsers')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#2D204A' }]}>
            <Ionicons name="key-outline" size={24} color="#A380FF" />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.actionTitle}>Kelola Pengguna & Reset Password</Text>
            <Text style={styles.actionDesc}>
              Lihat seluruh akun mahasiswa, ubah status hak akses, dan atur ulang kata sandi.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2338',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accentYellow,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  logoutText: {
    color: '#FF8080',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1726',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1D2D44',
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ADE80',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  statusSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0F1626',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  metricIconBox: {
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textWhite,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(247, 206, 69, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accentYellow,
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 11,
    color: '#D1D5DB',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D283E',
    marginBottom: 12,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});
