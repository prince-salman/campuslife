import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { ScheduleItem } from '../../models/schedule';

export interface ScheduleFormData {
  dayIndex: number;
  title: string;
  lecturer: string;
  room: string;
  time: string;
  timePeriod: string;
  duration: string;
  timeRange: string;
  headerColor: string;
  cardColor: string;
}

interface AddEditScheduleModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialDayIndex: number;
  initialItem?: ScheduleItem | null;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => void;
  onDelete?: (dayIndex: number, itemId: string) => void;
}

const DAYS_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const COLOR_THEMES = [
  { name: 'Teal', header: '#2E7979', card: '#5FB8B2' },
  { name: 'Navy', header: '#274975', card: '#4D7FA9' },
  { name: 'Purple', header: '#5A2E79', card: '#8C5FB8' },
  { name: 'Green', header: '#2E7958', card: '#57B288' },
  { name: 'Rose', header: '#792E4D', card: '#B85F82' },
  { name: 'Amber', header: '#755127', card: '#A87D4C' },
];

export const AddEditScheduleModal: React.FC<AddEditScheduleModalProps> = ({
  visible,
  mode,
  initialDayIndex,
  initialItem,
  onClose,
  onSave,
  onDelete,
}) => {
  const [dayIndex, setDayIndex] = useState<number>(initialDayIndex);
  const [title, setTitle] = useState<string>('');
  const [lecturer, setLecturer] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [time, setTime] = useState<string>('08');
  const [timePeriod, setTimePeriod] = useState<string>('am');
  const [duration, setDuration] = useState<string>('2 Jam');
  const [timeRange, setTimeRange] = useState<string>('08:00 WIB - 10:00 WIB');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setTitle(initialItem.title);
      setLecturer(initialItem.lecturer);
      setRoom(initialItem.room);
      setTime(initialItem.time);
      setTimePeriod(initialItem.timePeriod || 'am');
      setDuration(initialItem.duration || '2 Jam');
      setTimeRange(initialItem.timeRange || `${initialItem.time}:00 WIB`);
      setDayIndex(initialDayIndex);

      const colorIdx = COLOR_THEMES.findIndex(
        (c) => c.header.toLowerCase() === initialItem.headerColor.toLowerCase()
      );
      setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
    } else {
      // Add mode defaults
      setTitle('');
      setLecturer('');
      setRoom('');
      setTime('08');
      setTimePeriod('am');
      setDuration('2 Jam');
      setTimeRange('08:00 WIB - 10:00 WIB');
      setDayIndex(initialDayIndex >= 0 ? initialDayIndex : 0);
      setSelectedColorIndex(0);
    }
  }, [visible, mode, initialItem, initialDayIndex]);

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Perhatian', 'Silakan masukkan nama mata kuliah / kegiatan.');
      return;
    }
    if (cleanTitle.length > 100) {
      Alert.alert('Perhatian', 'Nama mata kuliah maksimal 100 karakter.');
      return;
    }

    const cleanLecturer = lecturer.trim() || 'Dosen Pengampu';
    const cleanRoom = room.trim() || 'R. Kuliah';
    const theme = COLOR_THEMES[selectedColorIndex] || COLOR_THEMES[0];

    onSave({
      dayIndex,
      title: cleanTitle,
      lecturer: cleanLecturer,
      room: cleanRoom,
      time: time.trim() || '08',
      timePeriod,
      duration: duration.trim() || '2 Jam',
      timeRange: timeRange.trim() || `${time}:00 WIB`,
      headerColor: theme.header,
      cardColor: theme.card,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!initialItem || !onDelete) return;

    Alert.alert(
      'Hapus Jadwal',
      `Apakah Anda yakin ingin menghapus jadwal "${initialItem.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            onDelete(dayIndex, initialItem.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons
                name={mode === 'edit' ? 'create-outline' : 'add-circle-outline'}
                size={22}
                color={Colors.accentYellow}
              />
              <Text style={styles.headerTitle}>
                {mode === 'edit' ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Hari Kuliah */}
            <Text style={styles.inputLabel}>Pilih Hari</Text>
            <View style={styles.daysRow}>
              {DAYS_NAMES.map((name, idx) => (
                <Pressable
                  key={name}
                  onPress={() => setDayIndex(idx)}
                  style={[
                    styles.dayChip,
                    dayIndex === idx && styles.dayChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      dayIndex === idx && styles.dayChipTextActive,
                    ]}
                  >
                    {name.substring(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.inputLabel}>Mata Kuliah / Kegiatan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Kecerdasan Buatan"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={title}
              onChangeText={setTitle}
            />

            {/* Lecturer */}
            <Text style={styles.inputLabel}>Dosen / Pengajar</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Dr. Budi Santoso"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={lecturer}
              onChangeText={setLecturer}
            />

            {/* Room */}
            <Text style={styles.inputLabel}>Ruangan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: B103 / Lab Komputer"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={room}
              onChangeText={setRoom}
            />

            {/* Time & Period Row */}
            <View style={styles.twoColRow}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Jam (Angka)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Periode</Text>
                <View style={styles.periodToggleRow}>
                  <Pressable
                    onPress={() => setTimePeriod('am')}
                    style={[
                      styles.periodBtn,
                      timePeriod === 'am' && styles.periodBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodBtnText,
                        timePeriod === 'am' && styles.periodBtnTextActive,
                      ]}
                    >
                      AM
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTimePeriod('pm')}
                    style={[
                      styles.periodBtn,
                      timePeriod === 'pm' && styles.periodBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodBtnText,
                        timePeriod === 'pm' && styles.periodBtnTextActive,
                      ]}
                    >
                      PM
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Time Range & Duration */}
            <View style={styles.twoColRow}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Rentang Waktu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08:00 - 10:00 WIB"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={timeRange}
                  onChangeText={setTimeRange}
                />
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Durasi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2 Jam"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            {/* Card Color Theme */}
            <Text style={styles.inputLabel}>Tema Warna Kartu</Text>
            <View style={styles.colorPaletteRow}>
              {COLOR_THEMES.map((theme, idx) => (
                <Pressable
                  key={theme.name}
                  onPress={() => setSelectedColorIndex(idx)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: theme.card },
                    selectedColorIndex === idx && styles.colorCircleSelected,
                  ]}
                >
                  {selectedColorIndex === idx && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color="#000000" />
                <Text style={styles.saveBtnText}>
                  {mode === 'edit' ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
                </Text>
              </Pressable>

              {mode === 'edit' && onDelete && (
                <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.deleteBtnText}>Hapus Jadwal</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  contentCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 6,
    marginTop: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 4,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayChipActive: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  dayChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#091026',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: Colors.textWhite,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1F2F5E',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  periodToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#091026',
    borderRadius: 12,
    height: 46,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1F2F5E',
  },
  periodBtn: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnActive: {
    backgroundColor: Colors.accentYellow,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  periodBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.accentYellow,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
