import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { walletService } from '../services/walletService';
import { TransactionType, TransactionModel } from '../models/transaction';
import { TransactionItemCard } from '../components/finance/TransactionItemCard';
import { AddTransactionModal } from '../components/finance/AddTransactionModal';

interface FinanceScreenProps {
  navigation?: any;
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const FinanceScreen: React.FC<FinanceScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);
  const isTablet = width >= 720;

  const [balance, setBalance] = useState<number>(walletService.getBalance());
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<TransactionType>('spent');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(7);
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<TransactionType>('income');

  useEffect(() => {
    const unsubscribe = walletService.subscribe(() => {
      setBalance(walletService.getBalance());
    });
    return unsubscribe;
  }, []);

  const currentMonthName = MONTHS[selectedMonthIndex];
  const spentAmount = walletService.getMonthlySpent(currentMonthName);

  const formatNumber = (amount: number): string => {
    const val = Math.floor(amount);
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePreviousMonth = () => {
    const newIndex = selectedMonthIndex > 0 ? selectedMonthIndex - 1 : MONTHS.length - 1;
    setSelectedMonthIndex(newIndex);
    walletService.setSelectedMonth(MONTHS[newIndex]);
  };

  const handleNextMonth = () => {
    const newIndex = selectedMonthIndex < MONTHS.length - 1 ? selectedMonthIndex + 1 : 0;
    setSelectedMonthIndex(newIndex);
    walletService.setSelectedMonth(MONTHS[newIndex]);
  };

  const openAddTransaction = (type: TransactionType) => {
    setModalType(type);
    setModalVisible(true);
  };

  const filteredTransactions: TransactionModel[] = walletService
    .getTransactions()
    .filter(
      (t) =>
        t.month.toLowerCase() === currentMonthName.toLowerCase() &&
        t.type === selectedTab
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.responsiveContainer}>
          {/* Top Bar Header */}
          <View style={[styles.topHeader, { paddingTop: topPadding }]}>
            <View style={styles.appIconBox}>
              <Ionicons name="school" size={20} color={Colors.primary} />
            </View>

            <View style={styles.screenPillRow}>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Schedule')}
                activeOpacity={0.7}
                style={styles.pillItem}
              >
                <Text style={styles.inactiveTabLabel}>Jadwal</Text>
              </TouchableOpacity>
              <View style={styles.pillItemActive}>
                <Text style={styles.activeTabLabel}>Keuangan</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Umkm')}
                activeOpacity={0.7}
                style={styles.pillItem}
              >
                <Text style={styles.inactiveTabLabel}>UMKM</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.avatarBorder}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>R</Text>
              </View>
            </View>
          </View>

          {/* Royal Blue Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceDecorativeCircle} />

            <View style={styles.balanceCardContent}>
              <View style={styles.balanceLeftSection}>
                <View style={styles.balanceValueRow}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <Text style={styles.balanceValue}>
                    {isBalanceVisible ? formatNumber(balance) : ' ••••••••'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                    style={styles.eyeIconButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.spentIndicatorRow}>
                  <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text
                    style={styles.spentIndicatorText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Rp{formatNumber(spentAmount)} sudah terpakai di {currentMonthName} {'>'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtonsCol}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openAddTransaction('income')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#000000" />
                  <Text style={styles.actionBtnText}>Income</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openAddTransaction('spent')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="remove" size={16} color="#000000" />
                  <Text style={styles.actionBtnText}>Spent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Month Selector Carousel */}
          <View style={styles.monthSelectorRow}>
            <TouchableOpacity
              style={styles.monthNavCircle}
              onPress={handlePreviousMonth}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color="#000000" />
            </TouchableOpacity>

            <View style={styles.monthPillContainer}>
              <Text style={styles.monthPillText}>{currentMonthName}</Text>
            </View>

            <TouchableOpacity
              style={styles.monthNavCircle}
              onPress={handleNextMonth}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-forward" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Big Center Spent Tracker */}
          <View style={styles.centerSpentSection}>
            <View style={styles.centerAmountRow}>
              <Text style={styles.centerCurrencyPrefix}>Rp</Text>
              <Text style={styles.centerAmountText}>
                {isBalanceVisible ? formatNumber(spentAmount) : ' ••••••••'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                style={styles.eyeIconButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.centerSubText}>
              sudah terpakai di {currentMonthName}
            </Text>
          </View>

          {/* Lower Sheet Section: Latest Transactions */}
          <View style={styles.bottomSheetContainer}>
            <Text style={styles.sectionHeading}>Latest Transaction</Text>

            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  selectedTab === 'income' && styles.segmentButtonActive,
                ]}
                onPress={() => setSelectedTab('income')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    selectedTab === 'income' && styles.segmentButtonTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  selectedTab === 'spent' && styles.segmentButtonActive,
                ]}
                onPress={() => setSelectedTab('spent')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    selectedTab === 'spent' && styles.segmentButtonTextActive,
                  ]}
                >
                  Spent
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionListContainer}>
              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="receipt-outline"
                    size={36}
                    color="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.emptyStateText}>
                    Belum ada transaksi {selectedTab} di bulan {currentMonthName}
                  </Text>
                </View>
              ) : (
                filteredTransactions.map((tx) => (
                  <TransactionItemCard key={tx.id} transaction={tx} />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <AddTransactionModal
        visible={modalVisible}
        initialType={modalType}
        onClose={() => setModalVisible(false)}
        onSaved={() => setSelectedTab(modalType)}
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
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
    flexGrow: 1,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    backgroundColor: '#0F1829',
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillItemActive: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  inactiveTabLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
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
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#0C389E',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceDecorativeCircle: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  balanceCardContent: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLeftSection: {
    flex: 1,
    paddingRight: 10,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 2,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  eyeIconButton: {
    padding: 6,
    marginLeft: 4,
  },
  spentIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  spentIndicatorText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '400',
    flexShrink: 1,
  },
  actionButtonsCol: {
    flexDirection: 'column',
    gap: 10,
  },
  actionBtn: {
    width: 105,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  monthNavCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPillContainer: {
    width: 190,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#091438',
    borderWidth: 1.5,
    borderColor: '#182A6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPillText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  centerSpentSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  centerAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCurrencyPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 2,
  },
  centerAmountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  centerSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  bottomSheetContainer: {
    backgroundColor: '#050D38',
    borderRadius: 24,
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 22,
    minHeight: 350,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 16,
    paddingLeft: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#131A33',
    borderRadius: 24,
    padding: 4,
    marginBottom: 18,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.accentYellow,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  segmentButtonTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  transactionListContainer: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
  },
});