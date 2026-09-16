import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { TransactionModel } from '../../models/transaction';
import { Ionicons } from '@expo/vector-icons';

interface TransactionItemCardProps {
  transaction: TransactionModel;
  onPress?: () => void;
}

export const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  transaction,
  onPress,
}) => {
  const getIconName = (name?: string): any => {
    switch (name) {
      case 'restaurant':
        return 'restaurant';
      case 'car':
        return 'car-sport';
      case 'document':
        return 'document-text';
      case 'gift':
        return 'gift';
      case 'wallet':
        return 'wallet';
      case 'briefcase':
        return 'briefcase';
      default:
        return 'pricetag';
    }
  };

  const formatAmount = (val: number): string => {
    return val.toLocaleString('id-ID');
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons
          name={getIconName(transaction.iconName || transaction.icon)}
          size={22}
          color="#7FA2E8"
        />
      </View>

      <View style={styles.contentCol}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.dateText}>{transaction.dateText}</Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.rpText}>Rp</Text>
        <Text style={styles.amountText}>{formatAmount(transaction.amount)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#091849',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: Colors.borderBlue,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#142B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#8FA7D8',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rpText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textWhite,
    marginRight: 2,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.5,
  },
});