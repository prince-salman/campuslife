import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface FinanceCardProps {
  balance: number;
  monthlySpent: number;
  currentMonth: string;
  onIncomeTap: () => void;
  onSpentTap: () => void;
  onHistoryTap?: () => void;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  balance,
  monthlySpent,
  currentMonth,
  onIncomeTap,
  onSpentTap,
  onHistoryTap,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={styles.balanceRow}>
          <Text style={styles.rpText}>Rp</Text>
          <Text style={styles.balanceText}>
            {isVisible ? formatNumber(balance) : ' ••••••••'}
          </Text>
          <Pressable
            onPress={() => setIsVisible(!isVisible)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable onPress={onHistoryTap} style={styles.historyRow}>
          <Ionicons name="wallet-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.historyText} numberOfLines={1}>
            Rp{formatNumber(monthlySpent)} sudah terpakai di {currentMonth} {'>'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.rightCol}>
        <Pressable onPress={onIncomeTap} style={styles.actionBtn}>
          <Ionicons name="add" size={16} color={Colors.textDark} />
          <Text style={styles.actionBtnText}>Income</Text>
        </Pressable>

        <Pressable onPress={onSpentTap} style={[styles.actionBtn, styles.spentMargin]}>
          <Ionicons name="remove" size={16} color={Colors.textDark} />
          <Text style={styles.actionBtnText}>Spent</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rpText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
    marginRight: 4,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.4,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  rightCol: {
    flexDirection: 'column',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.yellowAccent,
    width: 96,
    height: 34,
    borderRadius: 17,
    gap: 4,
  },
  spentMargin: {
    marginTop: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
});