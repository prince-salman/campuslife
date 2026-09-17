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
import { ScheduleService } from '../../services/scheduleService';
import { notificationService } from '../../services/notificationService';

export interface ScheduleFormData {
  dayIndex: number;
  title: string;
  lecturer: string;
  room: string;
  time: string;
  timePeriod: string;
  duration: string;
  endTime?: string;
  timeRange?: string;
  reminderMinutes?: number;
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

const DURATION_PRESETS = ['1 Jam', '1.5 Jam', '2 Jam', '2.5 Jam', '3 Jam'];
const REMINDER_PRESETS = [
  { label: '10 Menit', value: 10 },
  { label: '15 Menit', value: 15 },
  { label: '30 Menit', value: 30 },
  { label: '60 Menit', value: 60 },
  { label: 'Nonaktif', value: 0 },
];

const THEMES_BY_DAY = [
  { header: '#2E6F79', card: '#55A4B2' }, // Sen
  { header: '#2E7958', card: '#57B288' }, // Sel
  { header: '#3B3878', card: '#6560B0' }, // Rab
  { header: '#2E7979', card: '#5FB8B2' }, // Kam
  { header: '#792E4D', card: '#B85F82' }, // Jum
  { header: '#755127', card: '#A87D4C' }, // Sab
  { header: '#274975', card: '#4D7FA9' }, // Min
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
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);

  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setTitle(initialItem.title);
      setLecturer(initialItem.lecturer);
      setRoom(initialItem.room);
      setTime(initialItem.time);
      setTimePeriod(initialItem.timePeriod || 'am');
      setDuration(initialItem.duration || '2 Jam');
      setReminderMinutes(initialItem.reminderMinutes !== undefined ? initialItem.reminderMinutes : 15);
      setDayIndex(initialDayIndex);
    } else {
      setTitle('');
      setLecturer('');
      setRoom('');
      setTime('08');
      setTimePeriod('am');
      setDuration('2 Jam');
      setReminderMinutes(15);
      setDayIndex(initialDayIndex >= 0 ? initialDayIndex : 0);
    }
  }, [visible, mode, initialItem, initialDayIndex]);

  // Kalkulasi Jam Selesai & Rentang Waktu Otomatis secara Realtime
  const calculated = ScheduleService.calculateEndTime(time, timePeriod, duration);

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Perhatian', 'Silakan masukkan nama mata kuliah / kegiatan.');
      return;
    }

    const cleanLecturer = lecturer.trim() || 'Dosen Pengampu';
    const cleanRoom = room.trim() || 'R. Kuliah';
    const theme = THEMES_BY_DAY[dayIndex % THEMES_BY_DAY.length];

    const finalData: ScheduleFormData = {
      dayIndex,
      title: cleanTitle,
      lecturer: cleanLecturer,
      room: cleanRoom,
      time: time.trim() || '08',
      timePeriod,
      duration: duration.trim() || '2 Jam',
      endTime: calculated.endTime,
      timeRange: calculated.timeRange,
      reminderMinutes,
      headerColor: theme.header,
      cardColor: theme.card,
    };

    onSave(finalData);

    if (reminderMinutes > 0) {
      notificationService.sendNotification({
        title: `⏰ Pengingat Kuliah: ${cleanTitle}`,
        body: `Kelas di ${cleanRoom} (${calculated.timeRange}). Anda akan diingatkan ${reminderMinutes} menit sebelum mulai.`,
        isUrgent: false,
      }).catch(() => {});
    }

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
            {/* 1. Pilih Hari */}
            <Text style={styles.inputLabel}>Hari Kuliah *</Text>
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

            {/* 2. Mata Kuliah */}
            <Text style={styles.inputLabel}>Mata Kuliah / Kegiatan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Kecerdasan Buatan / Pemrograman Web"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={title}
              onChangeText={setTitle}
            />

            {/* 3. Dosen Pengampu */}
            <Text style={styles.inputLabel}>Dosen Pengampu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Dr. Budi Santoso, M.Kom"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={lecturer}
              onChangeText={setLecturer}
            />

            {/* 4. Ruangan Kelas */}
            <Text style={styles.inputLabel}>Ruangan Kelas *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: B103 / Lab Komputer 2"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={room}
              onChangeText={setRoom}
            />

            {/* 5. Jam Mulai & Periode (AM / PM) */}
            <View style={styles.twoColRow}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Jam Mulai (01 - 12)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08 atau 08:30"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Periode Waktu</Text>
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
                      AM (Pagi)
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
                      PM (Siang/Sore)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 6. Durasi */}
            <Text style={styles.inputLabel}>Durasi Kelas</Text>
            <View style={styles.presetChipsRow}>
              {DURATION_PRESETS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setDuration(item)}
                  style={[
                    styles.presetChip,
                    duration === item && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      duration === item && styles.presetChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 7. Jam Selesai Terisi Otomatis (Live Calculation) */}
            <View style={styles.autoCalcCard}>
              <View style={styles.autoCalcHeader}>
                <Ionicons name="time-outline" size={18} color={Colors.accentYellow} />
                <Text style={styles.autoCalcTitle}>Jam Selesai (Otomatis)</Text>
              </View>
              <Text style={styles.autoCalcResult}>{calculated.endTime}</Text>
              <Text style={styles.autoCalcSub}>
                Rentang: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{calculated.timeRange}</Text>
              </Text>
            </View>

            {/* 8. Pengingat Sebelum Kelas (Reminder) */}
            <Text style={styles.inputLabel}>
              <Ionicons name="notifications-outline" size={13} color={Colors.accentYellow} /> Pengingat Sebelum Kelas Dimulai
            </Text>
            <View style={styles.presetChipsRow}>
              {REMINDER_PRESETS.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => setReminderMinutes(item.value)}
                  style={[
                    styles.presetChip,
                    reminderMinutes === item.value && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      reminderMinutes === item.value && styles.presetChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark-circle" size={18} color="#000000" />
                <Text style={styles.saveBtnText}>
                  {mode === 'edit' ? 'Perbarui Jadwal Kuliah' : 'Simpan Jadwal Kuliah'}
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    color: 'rgba(255, 255, 255, 0.85)',
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
    gap: 4,
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
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  periodBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  presetChipActive: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  presetChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  autoCalcCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  autoCalcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  autoCalcTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentYellow,
  },
  autoCalcResult: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  autoCalcSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 16,
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
