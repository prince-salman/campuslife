import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { TransactionType } from '../../models/transaction';
import { walletService } from '../../services/walletService';
import { notificationService } from '../../services/notificationService';
import { formatRupiah } from '../../utils/currencyFormatter';
import { Ionicons } from '@expo/vector-icons';

interface AddTransactionModalProps {
  visible: boolean;
  initialType: TransactionType;
  onClose: () => void;
  onSaved?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  initialType,
  onClose,
  onSaved,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('restaurant');

  React.useEffect(() => {
    setType(initialType);
    setSelectedIcon(initialType === 'income' ? 'wallet' : 'restaurant');
  }, [initialType, visible]);

  const quickTitles = type === 'income'
    ? ['Uang Saku', 'Gaji Magang', 'Hadiah', 'Freelance']
    : ['Makan', 'Kopi', 'Bensin', 'Fotocopy', 'Belanja'];

  const quickAmounts = [10000, 20000, 50000, 100000];

  const handleSave = () => {
    const sanitizedTitle = title.trim();
    if (!sanitizedTitle) {
      alert('Silakan masukkan nama transaksi');
      return;
    }
    if (sanitizedTitle.length > 100) {
      alert('Nama transaksi maksimal 100 karakter');
      return;
    }

    const cleanAmount = amount.replace(/[^\d]/g, '');
    const numAmount = parseInt(cleanAmount, 10);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0 || !Number.isFinite(numAmount)) {
      alert('Silakan masukkan nominal yang valid (lebih dari 0)');
      return;
    }
    if (numAmount > 1000000000) {
      alert('Nominal maksimal Rp 1.000.000.000');
      return;
    }

    walletService.addTransaction({
      title: sanitizedTitle,
      amount: numAmount,
      type,
      iconName: selectedIcon,
    });

    // Send notification to device Notification Center
    notificationService.sendTransactionAlert(
      sanitizedTitle,
      formatRupiah(numAmount),
      type === 'income' ? 'income' : 'expense'
    ).catch((err) => {
      console.warn('Failed to send transaction notification:', err);
    });

    setTitle('');
    setAmount('');
    onSaved?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Toggle Income / Spent */}
            <View style={styles.toggleContainer}>
              <Pressable
                onPress={() => {
                  setType('income');
                  setSelectedIcon('wallet');
                }}
                style={[
                  styles.toggleBtn,
                  type === 'income' && styles.toggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    type === 'income' && styles.toggleTextActive,
                  ]}
                >
                  + Income
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setType('spent');
                  setSelectedIcon('restaurant');
                }}
                style={[
                  styles.toggleBtn,
                  type === 'spent' && styles.toggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    type === 'spent' && styles.toggleTextActive,
                  ]}
                >
                  - Spent
                </Text>
              </Pressable>
            </View>

            {/* Title Input */}
            <Text style={styles.inputLabel}>Nama Transaksi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Makan siang"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Quick Title Chips */}
            <View style={styles.chipsRow}>
              {quickTitles.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTitle(t)}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Amount Input */}
            <Text style={styles.inputLabel}>Nominal (Rp)</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^\d]/g, ''))}
            />

            {/* Quick Amount Chips */}
            <View style={styles.chipsRow}>
              {quickAmounts.map((amt) => (
                <Pressable
                  key={amt}
                  onPress={() => {
                    const current = parseInt(amount.replace(/[^\d]/g, '') || '0', 10) || 0;
                    setAmount((current + amt).toString());
                  }}
                  style={styles.chip}
                >
                  <Text style={styles.amountChipText}>+{amt / 1000}rb</Text>
                </Pressable>
              ))}
            </View>

            {/* Save Button */}
            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>
                {type === 'income' ? 'Simpan Pemasukan' : 'Simpan Pengeluaran'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#131A33',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  closeBtn: {
    padding: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#091026',
    borderRadius: 20,
    height: 42,
    marginBottom: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.yellowAccent,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    fontWeight: '800',
    color: Colors.textDark,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#091026',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: Colors.textWhite,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1F2F5E',
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.yellowAccent,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#19254D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '500',
  },
  amountChipText: {
    color: Colors.yellowAccent,
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: Colors.yellowAccent,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
});