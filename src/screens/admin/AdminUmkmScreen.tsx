import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { UmkmModel, UmkmServiceItem } from '../../models/umkm';
import { umkmService } from '../../services/umkmService';

export const AdminUmkmScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 16);

  const [umkmList, setUmkmList] = useState<UmkmModel[]>(umkmService.getUmkmList());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modal form states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('F&B');
  const [formPriceTag, setFormPriceTag] = useState<string>('15K');
  const [formBannerText, setFormBannerText] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formWhatsapp, setFormWhatsapp] = useState<string>('');
  const [formMapsUrl, setFormMapsUrl] = useState<string>('');
  const [formRating, setFormRating] = useState<string>('4.8');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formDistance, setFormDistance] = useState<string>('');
  const [formOpeningHours, setFormOpeningHours] = useState<string>('');
  const [formServices, setFormServices] = useState<UmkmServiceItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    umkmService.fetchUmkmList().then(setUmkmList).catch(() => {});
    const unsub = umkmService.subscribe(() => {
      setUmkmList(umkmService.getUmkmList());
    });
    return () => unsub();
  }, []);

  const categories = ['Semua', 'F&B', 'Laundry', 'Homestay', 'Fotocopy', 'Holiday'];

  const filteredList = umkmList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('F&B');
    setFormPriceTag('15K');
    setFormBannerText('');
    setFormImageUrl('');
    setFormWhatsapp('+62 812-');
    setFormMapsUrl('');
    setFormRating('4.8');
    setFormAddress('Kawasan Kampus President University, Cikarang');
    setFormDistance('100 m dari Kampus');
    setFormOpeningHours('08:00 – 21:00 WIB');
    setFormServices([
      { name: 'Menu / Jasa Utama', price: 'Rp 15.000', description: 'Deskripsi menu / layanan' },
    ]);
    setModalVisible(true);
  };

  const openEditModal = (item: UmkmModel) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPriceTag(item.priceTag);
    setFormBannerText(item.bannerText || '');
    setFormImageUrl(item.imageUrl || '');
    setFormWhatsapp(item.whatsapp || item.phone || '');
    setFormMapsUrl(item.mapsUrl || '');
    setFormRating(item.rating ? String(item.rating) : '4.8');
    setFormAddress(item.address || '');
    setFormDistance(item.distance || '');
    setFormOpeningHours(item.openingHours || '');
    setFormServices(
      item.services && item.services.length > 0
        ? JSON.parse(JSON.stringify(item.services))
        : []
    );
    setModalVisible(true);
  };

  const handleAddService = () => {
    setFormServices((prev) => [
      ...prev,
      { name: '', price: '', description: '' },
    ]);
  };

  const handleUpdateService = (index: number, field: keyof UmkmServiceItem, value: string) => {
    setFormServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveService = (index: number) => {
    setFormServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Peringatan', 'Nama UMKM wajib diisi.');
      return;
    }

    const parsedRating = parseFloat(formRating) || 4.8;
    const clampedRating = Math.min(5.0, Math.max(1.0, parsedRating));

    // Filter valid services
    const cleanedServices = formServices
      .filter((s) => s.name.trim().length > 0)
      .map((s) => ({
        name: s.name.trim(),
        price: s.price.trim() || 'Rp -',
        description: s.description?.trim() || '',
      }));

    setIsSaving(true);
    try {
      if (editingId) {
        // Update
        await umkmService.updateUmkm(editingId, {
          name: formName.trim(),
          category: formCategory,
          priceTag: formPriceTag.trim(),
          rating: clampedRating,
          bannerText: formBannerText.trim() || formName.trim().toUpperCase(),
          imageUrl: formImageUrl.trim(),
          whatsapp: formWhatsapp.trim(),
          phone: formWhatsapp.trim(),
          mapsUrl: formMapsUrl.trim(),
          address: formAddress.trim(),
          distance: formDistance.trim(),
          openingHours: formOpeningHours.trim(),
          services: cleanedServices,
        });
      } else {
        // Create
        await umkmService.createUmkm({
          name: formName.trim(),
          category: formCategory,
          priceTag: formPriceTag.trim(),
          rating: clampedRating,
          bannerText: formBannerText.trim() || formName.trim().toUpperCase(),
          imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
          whatsapp: formWhatsapp.trim(),
          mapsUrl: formMapsUrl.trim(),
          address: formAddress.trim(),
          distance: formDistance.trim(),
          openingHours: formOpeningHours.trim(),
          services: cleanedServices,
        });
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal menyimpan UMKM.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus UMKM "${name}" dari katalog kampus?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await umkmService.deleteUmkm(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Katalog UMKM</Text>
          <Text style={styles.headerSub}>Kelola data UMKM untuk seluruh mahasiswa</Text>
        </View>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#000000" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari UMKM kampus..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* UMKM List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: item.cardColorHex || '#2E6F79' }]}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              <Text style={styles.priceTag}>{item.priceTag}</Text>
            </View>

            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardThumbnail} resizeMode="cover" />
            ) : null}

            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardAddress} numberOfLines={1}>
              {item.address || 'Kawasan Kampus'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={13} color={Colors.accentYellow} />
                <Text style={styles.metaText}>{item.rating || 4.8}</Text>
              </View>
              <View style={[styles.metaItem, { marginLeft: 12 }]}>
                <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
                <Text style={styles.metaText}>{item.whatsapp || item.phone || '-'}</Text>
              </View>
              {item.mapsUrl ? (
                <View style={[styles.metaItem, { marginLeft: 12 }]}>
                  <Ionicons name="location" size={13} color={Colors.accentYellow} />
                  <Text style={styles.metaText}>Maps</Text>
                </View>
              ) : null}
            </View>

            {/* Action Buttons: Edit & Delete */}
            <View style={styles.cardActions}>
              <Pressable
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="pencil-outline" size={14} color="#55A4B2" />
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Add / Edit UMKM Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Data UMKM' : 'Tambah UMKM Baru'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.textWhite} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Nama UMKM / Usaha *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: Kokoes Bites"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categorySelectRow}>
                {['F&B', 'Laundry', 'Homestay', 'Fotocopy', 'Holiday'].map((c) => (
                  <Pressable
                    key={c}
                    style={[
                      styles.categoryOption,
                      formCategory === c && styles.categoryOptionActive,
                    ]}
                    onPress={() => setFormCategory(c)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formCategory === c && styles.categoryOptionTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Thumbnail Image URL & Preview */}
              <Text style={styles.inputLabel}>URL Gambar Thumbnail Lapak</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://images.unsplash.com/... atau URL gambar web"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formImageUrl}
                onChangeText={setFormImageUrl}
                autoCapitalize="none"
              />
              {formImageUrl && (formImageUrl.startsWith('http://') || formImageUrl.startsWith('https://')) ? (
                <View style={styles.thumbnailPreviewBox}>
                  <Image source={{ uri: formImageUrl }} style={styles.thumbnailPreviewImage} resizeMode="cover" />
                  <Text style={styles.thumbnailPreviewLabel}>✓ Preview Gambar Thumbnail</Text>
                </View>
              ) : null}

              {/* Rating Manual */}
              <Text style={styles.inputLabel}>Rating UMKM (1.0 - 5.0) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: 4.8"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formRating}
                onChangeText={setFormRating}
                keyboardType="decimal-pad"
              />

              {/* WhatsApp (Nomor Telepon Biasa Dihapus) */}
              <Text style={styles.inputLabel}>Nomor WhatsApp Lapak *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: 08123456789 atau +62 812-3456-7890"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formWhatsapp}
                onChangeText={setFormWhatsapp}
                keyboardType="phone-pad"
              />

              {/* Link / Koordinat Google Maps */}
              <Text style={styles.inputLabel}>Link / Koordinat Google Maps</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: https://maps.app.goo.gl/... atau -6.2891, 107.1692"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formMapsUrl}
                onChangeText={setFormMapsUrl}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Alamat Lengkap / Lokasi Lapak</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Jl. Kaliurang KM 5 / Kantin Mahasiswa Blok B"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formAddress}
                onChangeText={setFormAddress}
              />

              <Text style={styles.inputLabel}>Jarak dari Kampus</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="100 m dari Gerbang Utama"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formDistance}
                onChangeText={setFormDistance}
              />

              <Text style={styles.inputLabel}>Label Harga Rata-rata (Price Tag)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: 15K atau Rp 15.000"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formPriceTag}
                onChangeText={setFormPriceTag}
              />

              <Text style={styles.inputLabel}>Jam Buka / Operasional</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="09:00 – 21:00 WIB"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formOpeningHours}
                onChangeText={setFormOpeningHours}
              />

              <Text style={styles.inputLabel}>Tagline / Banner Card</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: BAKSO FAVORIT KAMPUS"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formBannerText}
                onChangeText={setFormBannerText}
              />

              {/* Dynamic Menu & Services Section */}
              <View style={styles.servicesHeaderContainer}>
                <View>
                  <Text style={styles.servicesSectionTitle}>Daftar Menu & Jasa yang Ditawarkan</Text>
                  <Text style={styles.servicesSectionSub}>
                    {formServices.length} item terdaftar
                  </Text>
                </View>
                <Pressable style={styles.addServiceButton} onPress={handleAddService}>
                  <Ionicons name="add" size={14} color="#000000" />
                  <Text style={styles.addServiceButtonText}>Tambah Item</Text>
                </Pressable>
              </View>

              {formServices.map((service, idx) => (
                <View key={`svc-${idx}`} style={styles.serviceItemBox}>
                  <View style={styles.serviceItemHeader}>
                    <Text style={styles.serviceItemBadge}>Menu #{idx + 1}</Text>
                    <Pressable
                      style={styles.deleteServiceBtn}
                      onPress={() => handleRemoveService(idx)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                    </Pressable>
                  </View>

                  <Text style={styles.subInputLabel}>Nama Menu / Jasa *</Text>
                  <TextInput
                    style={styles.modalSubInput}
                    placeholder="Contoh: Ayam Geprek Sambal Bawang"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={service.name}
                    onChangeText={(val) => handleUpdateService(idx, 'name', val)}
                  />

                  <Text style={styles.subInputLabel}>Harga *</Text>
                  <TextInput
                    style={styles.modalSubInput}
                    placeholder="Contoh: Rp 15.000 atau 15K"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={service.price}
                    onChangeText={(val) => handleUpdateService(idx, 'price', val)}
                  />

                  <Text style={styles.subInputLabel}>Deskripsi Singkat (Opsional)</Text>
                  <TextInput
                    style={styles.modalSubInput}
                    placeholder="Contoh: Nasi hangat + ayam krispi + sambal pedas"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={service.description || ''}
                    onChangeText={(val) => handleUpdateService(idx, 'description', val)}
                  />
                </View>
              ))}

              <Pressable
                style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan UMKM'}
                  </Text>
                )}
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
    backgroundColor: '#070A13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#1E2B45',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 13,
    marginLeft: 8,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#121927',
    borderWidth: 1,
    borderColor: '#1D2A42',
  },
  categoryChipActive: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#000000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: '#0F1626',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.accentYellow,
  },
  cardThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#0F1626',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  cardAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#172238',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 164, 178, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55A4B2',
    marginLeft: 4,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF8080',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F1626',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2338',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  modalForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#24324D',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.textWhite,
    fontSize: 13,
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#24324D',
  },
  categoryOptionActive: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  categoryOptionText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryOptionTextActive: {
    color: '#000000',
  },
  saveButton: {
    backgroundColor: Colors.accentYellow,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  thumbnailPreviewBox: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#24324D',
    backgroundColor: '#070A13',
  },
  thumbnailPreviewImage: {
    width: '100%',
    height: 120,
  },
  thumbnailPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#55A4B2',
    padding: 6,
    textAlign: 'center',
    backgroundColor: '#0F1626',
  },
  servicesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A2338',
  },
  servicesSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  servicesSectionSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addServiceButtonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 3,
  },
  serviceItemBox: {
    backgroundColor: '#070A13',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D2A42',
    padding: 12,
    marginBottom: 10,
  },
  serviceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceItemBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentYellow,
  },
  deleteServiceBtn: {
    padding: 4,
  },
  subInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8FA7D8',
    marginTop: 6,
    marginBottom: 3,
  },
  modalSubInput: {
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#24324D',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    color: Colors.textWhite,
    fontSize: 12,
  },
});
