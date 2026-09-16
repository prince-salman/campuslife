import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { SearchBarWidget } from '../components/common/SearchBarWidget';
import { CategoryTabs } from '../components/common/CategoryTabs';
import { UmkmModel } from '../models/umkm';

interface UmkmScreenProps {
  navigation?: any;
}

const ALL_UMKM: UmkmModel[] = [
  {
    id: '1',
    name: 'Kokoes Bites',
    category: 'F&B',
    priceTag: '15K',
    rating: 5.0,
    bannerText: 'Kokoes Dessert',
    cardColorHex: '#2C2D30',
  },
  {
    id: '2',
    name: 'Bakso Sapi Enak',
    category: 'F&B',
    priceTag: '10K',
    rating: 4.8,
    bannerText: 'BAKSO FAVORIT',
    cardColorHex: '#8B2500',
  },
  {
    id: '3',
    name: 'Ayam Geprek Kampus',
    category: 'F&B',
    priceTag: '12K',
    rating: 4.9,
    bannerText: 'AYAM GEPREK',
    cardColorHex: '#8B1A1A',
  },
  {
    id: '4',
    name: 'Paket Hemat Makan',
    category: 'F&B',
    priceTag: '50%',
    rating: 4.7,
    bannerText: 'MAKAN HEMAT',
    cardColorHex: '#9E2A2B',
  },
  {
    id: '5',
    name: 'Dimsum Mentai',
    category: 'F&B',
    priceTag: '18K',
    rating: 4.9,
    bannerText: 'DIMSUM MENTAI',
    cardColorHex: '#3D2314',
  },
  {
    id: '6',
    name: 'Dapur Sambal Bakar',
    category: 'F&B',
    priceTag: '15K',
    rating: 4.8,
    bannerText: 'SAMBAL BAKAR',
    cardColorHex: '#5C1D1D',
  },
  {
    id: '7',
    name: 'Laundry Kilat 3 Jam',
    category: 'Laundry',
    priceTag: '6K/kg',
    rating: 4.9,
    bannerText: 'CUCI SETRIKA',
    cardColorHex: '#1B3B6F',
  },
  {
    id: '8',
    name: 'Clean & Fresh Laundry',
    category: 'Laundry',
    priceTag: '7K/kg',
    rating: 4.8,
    bannerText: 'EXPRESS SERVICE',
    cardColorHex: '#21295C',
  },
  {
    id: '9',
    name: 'Kost & Homestay Asri',
    category: 'Homestay',
    priceTag: '850K',
    rating: 4.9,
    bannerText: 'KAMAR BERSIH AC',
    cardColorHex: '#1D4E3E',
  },
  {
    id: '10',
    name: 'Print & Copy Sentosa',
    category: 'Fotocopy',
    priceTag: '250/lbr',
    rating: 4.8,
    bannerText: 'PRINT SKRIPSI',
    cardColorHex: '#3C4048',
  },
  {
    id: '11',
    name: 'Campus Tour & Travel',
    category: 'Holiday',
    priceTag: '150K',
    rating: 4.9,
    bannerText: 'TRIP AKHIR PEKAN',
    cardColorHex: '#4A306D',
  },
];

export const UmkmScreen: React.FC<UmkmScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'F&B', 'Laundry', 'Homestay', 'Fotocopy', 'Holiday'];

  const filteredUmkm = ALL_UMKM.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bannerText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveContainer}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.appIconBox}>
              <Ionicons name="school" size={20} color={Colors.primary} />
            </View>

            <View style={styles.screenPillRow}>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Schedule')}
                activeOpacity={0.7}
              >
                <Text style={styles.inactiveTabLabel}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Finance')}
                activeOpacity={0.7}
              >
                <Text style={styles.inactiveTabLabel}>Money_Management</Text>
              </TouchableOpacity>
              <Text style={styles.activeTabLabel}>UMKM</Text>
            </View>

            <View style={styles.avatarBorder}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>R</Text>
              </View>
            </View>
          </View>

          {/* Banner Card */}
          <View style={styles.umkmBanner}>
            <View style={styles.umkmBannerLeft}>
              <Text style={styles.umkmBannerTitle}>Direktori UMKM</Text>
              <Text style={styles.umkmBannerSub}>
                Dukung lapak dan usaha sekitar kampus mahasiswa
              </Text>
            </View>
            <View style={styles.umkmBannerIconCircle}>
              <Ionicons name="storefront" size={28} color="#000000" />
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <SearchBarWidget
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari warung, laundry, fotocopy..."
            />
          </View>

          {/* Category Tabs */}
          <View style={styles.categorySection}>
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          {/* UMKM Results Grid */}
          <View style={styles.gridSection}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridTitle}>Daftar Lapak ({filteredUmkm.length})</Text>
              <Text style={styles.gridSubtitle}>Kategori: {selectedCategory}</Text>
            </View>

            {filteredUmkm.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>Tidak ada UMKM ditemukan</Text>
                <Text style={styles.emptySubText}>
                  Coba gunakan kata kunci pencarian atau kategori lain
                </Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {filteredUmkm.map((item) => (
                  <View key={item.id} style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.umkmCard,
                        { backgroundColor: item.cardColorHex || '#2C2D30' },
                      ]}
                      activeOpacity={0.85}
                    >
                      <View style={styles.cardTopRow}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>{item.category}</Text>
                        </View>
                        {item.priceTag && (
                          <View style={styles.priceTagBadge}>
                            <Text style={styles.priceTagText}>{item.priceTag}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.cardCenter}>
                        <Text style={styles.bannerCenterText} numberOfLines={2}>
                          {item.bannerText}
                        </Text>
                      </View>

                      <View style={styles.cardBottomRow}>
                        <Text style={styles.merchantName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.rating && (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 10,
    paddingBottom: 12,
  },
  appIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inactiveTabLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  activeTabLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  avatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#7A1B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  umkmBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  umkmBannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  umkmBannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  umkmBannerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  umkmBannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    marginTop: 8,
  },
  categorySection: {
    marginTop: 12,
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  gridSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItemWrapper: {
    width: '50%',
    padding: 6,
  },
  umkmCard: {
    height: 140,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priceTagBadge: {
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceTagText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerCenterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});