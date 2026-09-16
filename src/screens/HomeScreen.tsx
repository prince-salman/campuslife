import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { HeaderWidget } from '../components/common/HeaderWidget';
import { FirstLessonCard } from '../components/home/FirstLessonCard';
import { FinanceCard } from '../components/home/FinanceCard';
import { PromoBannerSlider } from '../components/home/PromoBannerSlider';
import { SearchBarWidget } from '../components/common/SearchBarWidget';
import { CategoryTabs } from '../components/common/CategoryTabs';
import { UmkmGrid } from '../components/home/UmkmGrid';
import { AddTransactionModal } from '../components/finance/AddTransactionModal';
import { NotificationModal } from '../components/common/NotificationModal';
import { walletService } from '../services/walletService';
import { TransactionType } from '../models/transaction';
import { UmkmModel } from '../models/umkm';

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);
  const isTablet = width >= 720;

  const [balance, setBalance] = useState<number>(walletService.getBalance());
  const [monthlySpent, setMonthlySpent] = useState<number>(walletService.getCurrentMonthSpent());
  const [currentMonth, setCurrentMonth] = useState<string>(walletService.getSelectedMonth());
  const [selectedCategory, setSelectedCategory] = useState<string>('F&B');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(() => {
      setBalance(walletService.getBalance());
      setMonthlySpent(walletService.getCurrentMonthSpent());
      setCurrentMonth(walletService.getSelectedMonth());
    });
    return unsubscribe;
  }, []);

  const categories = ['Laundry', 'F&B', 'Homestay', 'Fotocopy', 'Holiday'];

  const banners = [
    {
      id: 'b1',
      title: 'Laundry\nExpress',
      subtitle: 'Menerima Laundry :',
      services: ['Baju', 'Sepatu', 'Selimut', 'Alas Lantai', 'Sprei', 'Jaket'],
      contact: '+123-456-7890',
    },
    {
      id: 'b2',
      title: 'Percetakan &\nFotocopy',
      subtitle: 'Layanan Kilat Mahasiswa :',
      services: ['Skripsi', 'Jilid Hardcover', 'Poster A3', 'Stiker'],
      contact: '+123-888-9999',
    },
  ];

  const umkmList: UmkmModel[] = [
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
      bannerText: 'BAKSO FAVORIT',
      cardColorHex: '#8B2500',
    },
    {
      id: '3',
      name: 'Ayam Geprek Kampus',
      category: 'F&B',
      priceTag: '12K',
      bannerText: 'AYAM GEPREK',
      cardColorHex: '#8B1A1A',
    },
    {
      id: '4',
      name: 'Paket Hemat Makan',
      category: 'F&B',
      priceTag: '50%',
      bannerText: 'MAKAN HEMAT',
      cardColorHex: '#9E2A2B',
    },
    {
      id: '5',
      name: 'Dimsum Mentai',
      category: 'F&B',
      priceTag: '18K',
      bannerText: 'DIMSUM MENTAI',
      cardColorHex: '#3D2314',
    },
    {
      id: '6',
      name: 'Dapur Sambal Bakar',
      category: 'F&B',
      priceTag: '15K',
      bannerText: 'SAMBAL BAKAR',
      cardColorHex: '#5C1D1D',
    },
    {
      id: '7',
      name: 'Laundry Kilat 3 Jam',
      category: 'Laundry',
      priceTag: '6K/kg',
      bannerText: 'CUCI SETRIKA',
      cardColorHex: '#1B3B6F',
    },
    {
      id: '8',
      name: 'Kost & Homestay Asri',
      category: 'Homestay',
      priceTag: '850K',
      bannerText: 'KAMAR BERSIH AC',
      cardColorHex: '#1D4E3E',
    },
    {
      id: '9',
      name: 'Print & Copy Sentosa',
      category: 'Fotocopy',
      priceTag: '250/lbr',
      bannerText: 'PRINT SKRIPSI',
      cardColorHex: '#3C4048',
    },
  ];

  const filteredUmkm = umkmList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bannerText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.responsiveContainer, { paddingTop: topPadding }]}>
          <HeaderWidget
            userName="Salman"
            hasUnread={true}
            onNotificationPress={() => setNotificationModalVisible(true)}
            onProfilePress={() => {}}
          />

          {/* Responsive Dashboard: Side-by-side on tablet/desktop, stacked on mobile */}
          <View style={isTablet ? styles.desktopRow : styles.mobileCol}>
            <View style={isTablet ? styles.desktopCol : styles.sectionSpacer}>
              <FirstLessonCard
                schedule={{
                  id: '1',
                  title: 'Informatics',
                  time: '08',
                  timePeriod: 'am',
                  timeRange: '08:00 WIB - 10:00 WIB',
                  lecturer: 'Mr. John Liebert',
                  room: 'B103',
                  duration: '2 Hours',
                  headerColor: Colors.cardHeaderTeal,
                  cardColor: Colors.cardBodyTeal,
                }}
                onPressDetail={() => navigation?.navigate?.('Schedule')}
              />
            </View>

            <View style={isTablet ? styles.desktopCol : styles.sectionSpacer}>
              <FinanceCard
                balance={balance}
                monthlySpent={monthlySpent}
                currentMonth={currentMonth}
                onIncomeTap={() => openModal('income')}
                onSpentTap={() => openModal('spent')}
                onHistoryTap={() => navigation?.navigate?.('Finance')}
              />
            </View>
          </View>

          <View style={styles.sectionSpacer}>
            <PromoBannerSlider banners={banners} />
          </View>

          <View style={styles.sectionSpacer}>
            <SearchBarWidget
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari warung makan, laundry, kos..."
            />
          </View>

          <View style={styles.sectionSpacer}>
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          <View style={styles.sectionSpacer}>
            <Text style={styles.sectionTitle}>Rekomendasi UMKM Kampus</Text>
            <UmkmGrid items={filteredUmkm} />
          </View>
        </View>
      </ScrollView>

      <AddTransactionModal
        visible={modalVisible}
        initialType={modalType}
        onClose={() => setModalVisible(false)}
      />

      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    flexGrow: 1,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingTop: Platform.OS === 'web' ? 12 : 6,
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    alignItems: 'stretch',
  },
  desktopCol: {
    flex: 1,
  },
  mobileCol: {
    flexDirection: 'column',
  },
  sectionSpacer: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});