import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface MonthPickerModalProps {
  visible: boolean;
  currentMonthYear: string;
  onClose: () => void;
  onSelect: (monthYear: string) => void;
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

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  currentMonthYear,
  onClose,
  onSelect,
}) => {
  // Parse currentMonthYear like "Juni, 2026" or "June, 2026"
  const parseCurrent = () => {
    const parts = currentMonthYear.split(',').map((s) => s.trim());
    const m = parts[0] || 'Juni';
    const y = parseInt(parts[1] || '2026', 10) || 2026;
    return { month: m, year: y };
  };

  const current = parseCurrent();
  const [selectedYear, setSelectedYear] = useState<number>(current.year);

  const handleSelectMonth = (monthName: string) => {
    onSelect(`${monthName}, ${selectedYear}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="calendar" size={20} color={Colors.accentYellow} />
              <Text style={styles.titleText}>Pilih Bulan</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          {/* Year Switcher */}
          <View style={styles.yearRow}>
            <Pressable
              onPress={() => setSelectedYear((prev) => prev - 1)}
              style={styles.yearArrowBtn}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.accentYellow} />
            </Pressable>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <Pressable
              onPress={() => setSelectedYear((prev) => prev + 1)}
              style={styles.yearArrowBtn}
              hitSlop={8}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.accentYellow} />
            </Pressable>
          </View>

          {/* Months Grid */}
          <View style={styles.monthsGrid}>
            {MONTHS.map((month) => {
              const isSelected =
                current.month.toLowerCase().startsWith(month.toLowerCase().substring(0, 3)) &&
                current.year === selectedYear;

              return (
                <Pressable
                  key={month}
                  onPress={() => handleSelectMonth(month)}
                  style={[
                    styles.monthItem,
                    isSelected && styles.monthItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      isSelected && styles.monthItemTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0E172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  closeBtn: {
    padding: 4,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  yearArrowBtn: {
    padding: 4,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthItem: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthItemSelected: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  monthItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  monthItemTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
