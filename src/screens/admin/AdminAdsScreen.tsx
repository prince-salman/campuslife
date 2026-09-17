import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { adService } from '../../services/adService';
import { PromoBannerModel } from '../../models/banner';

interface AdminAdsScreenProps {
  navigation?: any;
}

const parseServices = (raw: string): string[] => {
  return raw
    .replace(/[•\r\n]/g, ',')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export const AdminAdsScreen: React.FC<AdminAdsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 16);

  const [ads, setAds] = useState<PromoBannerModel[]>(adService.getAds());
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [servicesText, setServicesText] = useState<string>('');
  const [contact, setContact] = useState<string>('');

  useEffect(() => {
    const unsub = adService.subscribe(() => {
      setAds(adService.getAds());
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedAdId(null);
    setTitle('');
    setSubtitle('Menerima Layanan :');
    setServicesText('');
    setContact('');
    setModalVisible(true);
  };

  const openEditModal = (item: PromoBannerModel) => {
    setModalMode('edit');
    setSelectedAdId(item.id);
    setTitle(item.title.replace('\n', ' '));
    setSubtitle(item.subtitle);
    setServicesText(item.services.join(', '));
    setContact(item.contact);
    setModalVisible(true);
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Perhatian', 'Judul iklan wajib diisi.');
      return;
    }

    const cleanSubtitle = subtitle.trim() || 'Layanan Kampus :';
    const cleanContact = contact.trim() || '+62 812-0000-0000';
    const parsedServices = parseServices(servicesText);

    if (modalMode === 'add') {
      adService.addAd({
        title: cleanTitle,
        subtitle: cleanSubtitle,
        services: parsedServices.length > 0 ? parsedServices : ['Layanan Kilat', 'Terpercaya'],
        contact: cleanContact,
      });
      Alert.alert('Berhasil', 'Iklan promosi berhasil diterbitkan ke halaman mahasiswa!');
    } else if (modalMode === 'edit' && selectedAdId) {
      adService.updateAd(selectedAdId, {
        title: cleanTitle,
        subtitle: cleanSubtitle,
        services: parsedServices.length > 0 ? parsedServices : ['Layanan Kilat', 'Terpercaya'],
        contact: cleanContact,
      });
      Alert.alert('Berhasil', 'Perubahan iklan berhasil disimpan!');
    }

    setModalVisible(false);
  };

  const handleDelete = (item: PromoBannerModel) => {
    Alert.alert(
      'Hapus Iklan',
      `Apakah Anda yakin ingin menghapus iklan "${item.title.replace('\n', ' ')}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            adService.deleteAd(item.id);
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Pulihkan Iklan Default',
      'Kembalikan iklan ke setelan awal (Laundry Express & Percetakan)?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pulihkan',
          onPress: () => {
            adService.resetToDefault();
          },
        },
      ]
    );
  };

  const previewServicesList = parseServices(servicesText);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Kelola Iklan & Promo</Text>
          <Text style={styles.headerSub}>Atur banner yang tampil di Home mahasiswa</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#000000" />
          <Text style={styles.addBtnText}>Tambah Iklan</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <Ionicons name="megaphone-outline" size={20} color={Colors.accentYellow} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoBannerTitle}>Live Slider Mahasiswa</Text>
            <Text style={styles.infoBannerSub}>
              Setiap penambahan atau perubahan iklan di sini akan langsung tampil pada slider kartu biru di beranda mahasiswa.
            </Text>
          </View>
        </View>

        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>DAFTAR IKLAN AKTIF ({ads.length})</Text>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetBtnText}>Pulihkan Default</Text>
          </Pressable>
        </View>

        {ads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>Belum Ada Iklan Aktif</Text>
            <Text style={styles.emptySub}>Tekan tombol Tambah Iklan untuk mempublikasikan banner promosi.</Text>
          </View>
        ) : (
          ads.map((item) => (
            <View key={item.id} style={styles.adItemWrapper}>
              {/* Banner Visual Preview (Exact Blue Card Style) */}
              <View style={styles.bannerCardPreview}>
                <Text style={styles.previewTitle}>{item.title}</Text>
                <Text style={styles.previewSubtitle}>{item.subtitle}</Text>
                <Text style={styles.previewServices}>{item.services.join(' • ')}</Text>
                <Text style={styles.previewContact}>Hubungi: {item.contact}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.editActionBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.accentYellow} />
                  <Text style={styles.editActionText}>Edit Iklan</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteActionBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.deleteActionText}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Tambah Iklan Baru' : 'Edit Banner Iklan'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Judul Iklan */}
              <Text style={styles.inputLabel}>Judul Iklan / Nama Usaha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Laundry Express / Rental Kamera"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={title}
                onChangeText={setTitle}
              />

              {/* Sub-judul */}
              <Text style={styles.inputLabel}>Sub-judul / Tagline Promosi *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Menerima Laundry : / Layanan Kilat :"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={subtitle}
                onChangeText={setSubtitle}
              />

              {/* Poin Layanan */}
              <Text style={styles.inputLabel}>Daftar Layanan (Pisahkan dengan Koma / Enter) *</Text>
              <TextInput
                style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Contoh: Baju, Sepatu, Selimut, Sprei, Jaket"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={servicesText}
                onChangeText={setServicesText}
                multiline
              />

              {/* Nomor Kontak */}
              <Text style={styles.inputLabel}>Nomor Kontak / WhatsApp *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: +123-456-7890 / 08123456789"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
              />

              {/* Live Preview Card */}
              <Text style={styles.inputLabel}>Preview Tampilan di HP Mahasiswa:</Text>
              <View style={styles.bannerCardPreview}>
                <Text style={styles.previewTitle}>{title || 'Judul Iklan'}</Text>
                <Text style={styles.previewSubtitle}>{subtitle || 'Tagline Layanan :'}</Text>
                <Text style={styles.previewServices}>
                  {previewServicesList.length > 0
                    ? previewServicesList.join(' • ')
                    : 'Layanan 1 • Layanan 2 • Layanan 3'}
                </Text>
                <Text style={styles.previewContact}>
                  Hubungi: {contact || '+62 8xx-xxxx-xxxx'}
                </Text>
              </View>

              <Pressable style={styles.saveModalBtn} onPress={handleSave}>
                <Ionicons name="checkmark-circle" size={18} color="#000000" />
                <Text style={styles.saveModalBtnText}>
                  {modalMode === 'add' ? 'Terbitkan Iklan' : 'Simpan Perubahan'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C1E',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A234A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentYellow,
  },
  infoBannerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    lineHeight: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  emptyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  adItemWrapper: {
    marginBottom: 20,
  },
  bannerCardPreview: {
    backgroundColor: Colors.blueCardStart,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentYellow,
    marginBottom: 6,
  },
  previewServices: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 10,
    lineHeight: 16,
  },
  previewContact: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  editActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentYellow,
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#091026',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1F2F5E',
  },
  saveModalBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.accentYellow,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
});
