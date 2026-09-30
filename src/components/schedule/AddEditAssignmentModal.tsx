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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AssignmentTask, TaskPriority } from '../../models/assignment';
import { CreateAssignmentInput, AVAILABLE_CLASSES } from '../../services/assignmentService';
import { scheduleService } from '../../services/scheduleService';

interface AddEditAssignmentModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialItem?: AssignmentTask | null;
  defaultClassName?: string;
  onClose: () => void;
  onSave: (data: CreateAssignmentInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COMMON_COURSES = [
  'Web Programming',
  'Calculus',
  'Discrete Mathematics',
  'Programming Concepts',
  'Computer Network',
  'Probability and Statistics',
  'Economic Survival 1',
  'Survival English',
];

export const AddEditAssignmentModal: React.FC<AddEditAssignmentModalProps> = ({
  visible,
  mode,
  initialItem,
  defaultClassName = 'IT 1',
  onClose,
  onSave,
  onDelete,
}) => {
  const activePuisCourses = scheduleService.getActiveCourses();
  const availableCourses = activePuisCourses.length > 0 ? activePuisCourses : COMMON_COURSES;

  const [className, setClassName] = useState<string>(defaultClassName);
  const [courseName, setCourseName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('23:59 WIB');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [submissionLink, setSubmissionLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setClassName(initialItem.className || defaultClassName);
      setCourseName(initialItem.courseName);
      setTitle(initialItem.title);
      setDescription(initialItem.description || '');
      setDeadlineDate(initialItem.deadlineDate);
      setDeadlineTime(initialItem.deadlineTime || '23:59 WIB');
      setPriority(initialItem.priority || 'medium');
      setSubmissionLink(initialItem.submissionLink || '');
    } else {
      setClassName(defaultClassName);
      setCourseName('');
      setTitle('');
      setDescription('');

      // Default deadline: 3 hari dari sekarang
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDeadlineDate(`${yyyy}-${mm}-${dd}`);

      setDeadlineTime('23:59 WIB');
      setPriority('high');
      setSubmissionLink('');
    }
  }, [initialItem, mode, visible, defaultClassName]);

  const handleSetQuickDays = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSave = async () => {
    if (!className.trim()) {
      Alert.alert('Peringatan', 'Pilih kelas tugas (contoh: IT 1).');
      return;
    }
    if (!courseName.trim()) {
      Alert.alert('Peringatan', 'Nama mata kuliah wajib diisi.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Peringatan', 'Judul tugas wajib diisi.');
      return;
    }
    if (!deadlineDate.trim()) {
      Alert.alert('Peringatan', 'Batas tanggal pengumpulan (deadline) wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        className: className.trim(),
        courseName: courseName.trim(),
        title: title.trim(),
        description: description.trim(),
        deadlineDate: deadlineDate.trim(),
        deadlineTime: deadlineTime.trim() || '23:59 WIB',
        priority,
        submissionLink: submissionLink.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialItem || !onDelete) return;

    Alert.alert(
      'Hapus Tugas Kelas',
      `Apakah Anda yakin ingin menghapus tugas "${initialItem.title}" untuk kelas ${initialItem.className}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await onDelete(initialItem.id);
              onClose();
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err.message || 'Terjadi kesalahan.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="clipboard" size={20} color={Colors.accentYellow} />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {mode === 'add' ? 'Tambah Tugas Kelas' : 'Edit Tugas Kelas'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Khusus Class Manager & Administrator
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textWhite} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Target Class */}
            <Text style={styles.fieldLabel}>PILIH KELAS MAHASISWA</Text>
            <View style={styles.classChipsRow}>
              {AVAILABLE_CLASSES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.classChip, className === c && styles.classChipActive]}
                  onPress={() => setClassName(c)}
                >
                  <Text style={[styles.classChipText, className === c && styles.classChipTextActive]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Course Name */}
            <Text style={styles.fieldLabel}>MATA KULIAH</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Algorithms & Data Structures"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={courseName}
              onChangeText={setCourseName}
            />

            {/* Common Course Fast Selectors */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {availableCourses.map((course) => (
                <Pressable
                  key={course}
                  style={[styles.presetChip, courseName === course && styles.presetChipActive]}
                  onPress={() => setCourseName(course)}
                >
                  <Text style={[styles.presetChipText, courseName === course && styles.presetChipTextActive]}>
                    {course}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Assignment Title */}
            <Text style={styles.fieldLabel}>JUDUL TUGAS</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Tugas 1: Binary Search Tree Implementation"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>PETUNJUK PENGERJAAN / DESKRIPSI</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tuliskan format pengumpulan, bobot penilaian, ketentuan kelompok, dll..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Deadline Date & Presets */}
            <Text style={styles.fieldLabel}>BATAS WAKTU (DEADLINE DATE)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (Contoh: 2026-10-15)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={deadlineDate}
              onChangeText={setDeadlineDate}
            />

            <View style={styles.quickDaysRow}>
              <Pressable style={styles.quickDayBtn} onPress={() => handleSetQuickDays(2)}>
                <Text style={styles.quickDayText}>+2 Hari</Text>
              </Pressable>
              <Pressable style={styles.quickDayBtn} onPress={() => handleSetQuickDays(3)}>
                <Text style={styles.quickDayText}>+3 Hari</Text>
              </Pressable>
              <Pressable style={styles.quickDayBtn} onPress={() => handleSetQuickDays(7)}>
                <Text style={styles.quickDayText}>+1 Minggu</Text>
              </Pressable>
              <Pressable style={styles.quickDayBtn} onPress={() => handleSetQuickDays(14)}>
                <Text style={styles.quickDayText}>+2 Minggu</Text>
              </Pressable>
            </View>

            {/* Deadline Time */}
            <Text style={styles.fieldLabel}>JAM DEADLINE</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 23:59 WIB"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={deadlineTime}
              onChangeText={setDeadlineTime}
            />

            {/* Priority Selector */}
            <Text style={styles.fieldLabel}>TINGKAT PRIORITAS</Text>
            <View style={styles.priorityRow}>
              <Pressable
                style={[
                  styles.priorityBtn,
                  priority === 'high' && styles.priorityBtnHigh,
                ]}
                onPress={() => setPriority('high')}
              >
                <Ionicons name="flame" size={16} color={priority === 'high' ? '#FFFFFF' : '#EF4444'} />
                <Text style={[styles.priorityText, priority === 'high' && styles.priorityTextActive]}>
                  Tinggi (High)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.priorityBtn,
                  priority === 'medium' && styles.priorityBtnMedium,
                ]}
                onPress={() => setPriority('medium')}
              >
                <Ionicons name="alert-circle" size={16} color={priority === 'medium' ? '#000000' : Colors.accentYellow} />
                <Text style={[styles.priorityText, priority === 'medium' && styles.priorityTextDarkActive]}>
                  Sedang (Medium)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.priorityBtn,
                  priority === 'normal' && styles.priorityBtnNormal,
                ]}
                onPress={() => setPriority('normal')}
              >
                <Ionicons name="checkmark-circle" size={16} color={priority === 'normal' ? '#FFFFFF' : '#38BDF8'} />
                <Text style={[styles.priorityText, priority === 'normal' && styles.priorityTextActive]}>
                  Normal
                </Text>
              </Pressable>
            </View>

            {/* Submission Link */}
            <Text style={styles.fieldLabel}>LINK PENGUMPULAN (OPSIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: https://lms.president.ac.id/mod/assign..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={submissionLink}
              onChangeText={setSubmissionLink}
              autoCapitalize="none"
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            {mode === 'edit' && onDelete && (
              <Pressable
                style={[styles.deleteBtn, isDeleting && styles.disabledBtn]}
                onPress={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FF6B6B" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </>
                )}
              </Pressable>
            )}

            <Pressable
              style={[styles.saveBtn, isSubmitting && styles.disabledBtn]}
              onPress={handleSave}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#000000" />
                  <Text style={styles.saveBtnText}>
                    {mode === 'add' ? 'Terbitkan Tugas' : 'Simpan Perubahan'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#0F1626',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  modalSubtitle: {
    fontSize: 11,
    color: Colors.accentYellow,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  classChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  classChip: {
    flex: 1,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  classChipActive: {
    backgroundColor: '#0C389E',
    borderColor: '#38BDF8',
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  classChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textWhite,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  presetsRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  presetChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    borderColor: Colors.accentYellow,
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
  },
  presetChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: Colors.accentYellow,
    fontWeight: '700',
  },
  quickDaysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  quickDayBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickDayText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 4,
  },
  priorityBtnHigh: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  priorityBtnMedium: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  priorityBtnNormal: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: '#FFFFFF',
  },
  priorityTextDarkActive: {
    color: '#000000',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 6,
  },
  deleteBtnText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentYellow,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 6,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
