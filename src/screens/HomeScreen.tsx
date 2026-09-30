import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  useWindowDimensions,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
import { UmkmDetailModal } from '../components/common/UmkmDetailModal';
import { walletService } from '../services/walletService';
import { scheduleService } from '../services/scheduleService';
import { assignmentService } from '../services/assignmentService';
import { TransactionType } from '../models/transaction';
import { UmkmModel } from '../models/umkm';
import { ScheduleItem } from '../models/schedule';
import { AssignmentTask } from '../models/assignment';
import { umkmService } from '../services/umkmService';
import { adService } from '../services/adService';
import { PromoBannerModel } from '../models/banner';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);
  const isTablet = width >= 720;
  const { user, logout } = useAuth();

  const [balance, setBalance] = useState<number>(walletService.getBalance());
  const [monthlySpent, setMonthlySpent] = useState<number>(walletService.getCurrentMonthSpent());
  const [currentMonth, setCurrentMonth] = useState<string>(walletService.getSelectedMonth());
  const [firstLesson, setFirstLesson] = useState<ScheduleItem | null>(scheduleService.getFirstLesson());
  const [selectedCategory, setSelectedCategory] = useState<string>('F&B');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [umkmList, setUmkmList] = useState<UmkmModel[]>(umkmService.getUmkmList());
  const [banners, setBanners] = useState<PromoBannerModel[]>(adService.getAds());
  const [nearestTask, setNearestTask] = useState<AssignmentTask | null>(
    assignmentService.getAssignments(user?.managedClass || 'IT 1')[0] || null
  );
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
  const [selectedUmkm, setSelectedUmkm] = useState<UmkmModel | null>(null);

  useEffect(() => {
    if (user?.id) {
      walletService.setUserId(user.id).then(() => {
        setBalance(walletService.getBalance());
        setMonthlySpent(walletService.getCurrentMonthSpent());
        setCurrentMonth(walletService.getSelectedMonth());
      });
      scheduleService.setUserId(user.id).then(() => {
        setFirstLesson(scheduleService.getFirstLesson());
      });
    }

    umkmService.fetchUmkmList().then(setUmkmList).catch(() => {});
    const unsubUmkm = umkmService.subscribe(() => {
      setUmkmList(umkmService.getUmkmList());
    });

    const unsubWallet = walletService.subscribe(() => {
      setBalance(walletService.getBalance());
      setMonthlySpent(walletService.getCurrentMonthSpent());
      setCurrentMonth(walletService.getSelectedMonth());
    });

    const unsubSchedule = scheduleService.subscribe(() => {
      setFirstLesson(scheduleService.getFirstLesson());
    });

    const unsubAds = adService.subscribe(() => {
      setBanners(adService.getAds());
    });

    const unsubAssignments = assignmentService.subscribe(() => {
      const classTasks = assignmentService.getAssignments(user?.managedClass || 'IT 1');
      setNearestTask(classTasks[0] || null);
    });

    return () => {
      unsubUmkm();
      unsubWallet();
      unsubSchedule();
      unsubAds();
      unsubAssignments();
    };
  }, [user?.id, user?.managedClass]);

  const categories = ['Semua', 'F&B', 'Laundry', 'Homestay', 'Fotocopy', 'Holiday'];

  const filteredUmkm = umkmList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bannerText && item.bannerText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Profil Mahasiswa',
      `Nama: ${user?.fullName || 'Mahasiswa'}\nEmail: ${user?.email || '-'}\nRole: ${user?.role === 'admin' ? 'Administrator' : 'Mahasiswa Aktif'}`,
      [
        { text: 'Tutup', style: 'cancel' },
        {
          text: 'Keluar (Logout)',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
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
            userName={user?.fullName ? user.fullName.split(' ')[0] : 'Mahasiswa'}
            hasUnread={true}
            onNotificationPress={() => setNotificationModalVisible(true)}
            onProfilePress={handleProfilePress}
            onLogoutPress={logout}
          />

          {/* Quick Assignment Reminder Banner */}
          {nearestTask && (
            <Pressable
              style={styles.taskBanner}
              onPress={() => navigation?.navigate?.('Schedule')}
            >
              <View style={styles.taskBannerIcon}>
                <Ionicons name="clipboard" size={18} color={Colors.accentYellow} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.taskBannerClass}>[{nearestTask.className}]</Text>
                  <Text style={styles.taskBannerTitle} numberOfLines={1}>{nearestTask.title}</Text>
                </View>
                <Text style={styles.taskBannerDeadline} numberOfLines={1}>
                  Tenggat: {nearestTask.deadlineDate} ({nearestTask.deadlineTime}) - {nearestTask.courseName}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}

          {/* Responsive Dashboard: Side-by-side on tablet/desktop, stacked on mobile */}
          <View style={isTablet ? styles.desktopRow : styles.mobileCol}>
            <View style={isTablet ? styles.desktopCol : styles.sectionSpacer}>
              <FirstLessonCard
                schedule={firstLesson}
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
            <UmkmGrid items={filteredUmkm} onItemPress={setSelectedUmkm} />
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

      <UmkmDetailModal
        visible={!!selectedUmkm}
        item={selectedUmkm}
        onClose={() => setSelectedUmkm(null)}
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
  taskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.4)',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  taskBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBannerClass: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentYellow,
    marginRight: 6,
  },
  taskBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
    flex: 1,
  },
  taskBannerDeadline: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});