import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleCalendarHeader } from '../components/schedule/ScheduleCalendarHeader';
import { ScheduleTimelineCard } from '../components/schedule/ScheduleTimelineCard';
import { MonthPickerModal } from '../components/schedule/MonthPickerModal';
import {
  AddEditScheduleModal,
  ScheduleFormData,
} from '../components/schedule/AddEditScheduleModal';
import { scheduleService } from '../services/scheduleService';
import { puisService } from '../services/puisService';
import { DaySchedule, ScheduleItem } from '../models/schedule';
import { useAuth } from '../context/AuthContext';
import { assignmentService, AVAILABLE_CLASSES, CreateAssignmentInput } from '../services/assignmentService';
import { AssignmentTask } from '../models/assignment';
import { AssignmentCard } from '../components/schedule/AssignmentCard';
import { AddEditAssignmentModal } from '../components/schedule/AddEditAssignmentModal';
import { notificationService } from '../services/notificationService';

export const ScheduleScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);
  const { user, canManageAssignments, isClassManager, isAdmin } = useAuth();
  const canManageSchedule = isClassManager || isAdmin;

  const [activeTab, setActiveTab] = useState<'schedule' | 'assignments'>('schedule');

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(scheduleService.getWeekSchedule());
  const [monthYear, setMonthYear] = useState<string>(scheduleService.getSelectedMonthYear());
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(scheduleService.getSelectedDayIndex());
  const [monthPickerVisible, setMonthPickerVisible] = useState<boolean>(false);
  const [addEditModalVisible, setAddEditModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>(user?.managedClass || 'IT 1');
  const [tasks, setTasks] = useState<AssignmentTask[]>(assignmentService.getAssignments(selectedClass));
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('Semua');

  const [assignmentModalVisible, setAssignmentModalVisible] = useState<boolean>(false);
  const [assignmentModalMode, setAssignmentModalMode] = useState<'add' | 'edit'>('add');
  const [editingTask, setEditingTask] = useState<AssignmentTask | null>(null);

  const [puisModalVisible, setPuisModalVisible] = useState<boolean>(false);
  const [puisEmail, setPuisEmail] = useState<string>('');
  const [puisPassword, setPuisPassword] = useState<string>('');
  const [isSyncingPuis, setIsSyncingPuis] = useState<boolean>(false);

  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [cancellingItem, setCancellingItem] = useState<ScheduleItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Dosen Berhalangan Hadir');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');

  const handleSyncPuis = async () => {
    if (!puisEmail.trim() || !puisPassword.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan email / student ID dan password akun PUIS.');
      return;
    }

    setIsSyncingPuis(true);
    try {
      const res = await puisService.syncScheduleFromPuis(puisEmail, puisPassword);
      scheduleService.resetToCurrentDeviceDate();
      setWeekSchedule(scheduleService.getWeekSchedule());

      const syncedTaskCount = await assignmentService.syncAssignmentsFromPuisCourses(selectedClass, user);

      setPuisPassword('');
      setPuisModalVisible(false);

      Alert.alert(
        'Sinkronisasi PUIS Berhasil',
        `Berhasil memuat jadwal resmi untuk ${res.profile.fullName} (NIM: ${res.profile.nim}).\n\nTotal: ${res.courseCount} Mata Kuliah (${res.sessionCount} Sesi Kuliah Kelas ${selectedClass}).\n${syncedTaskCount > 0 ? `Otomatis menambahkan ${syncedTaskCount} silabus tugas baru untuk kelas ${selectedClass}.` : 'Daftar tugas kelas telah diselaraskan dengan jadwal PUIS.'}`
      );
    } catch (e: any) {
      Alert.alert('Gagal Sinkronisasi PUIS', e.message || 'Terjadi kesalahan saat menghubungkan ke PUIS.');
    } finally {
      setIsSyncingPuis(false);
    }
  };

  useEffect(() => {

    scheduleService.resetToCurrentDeviceDate();
    setWeekSchedule(scheduleService.getWeekSchedule());
    setMonthYear(scheduleService.getSelectedMonthYear());
    setSelectedDayIndex(scheduleService.getSelectedDayIndex());

    const unsubSchedule = scheduleService.subscribe(() => {
      setWeekSchedule(scheduleService.getWeekSchedule());
      setMonthYear(scheduleService.getSelectedMonthYear());
      setSelectedDayIndex(scheduleService.getSelectedDayIndex());
    });

    return unsubSchedule;
  }, []);

  useEffect(() => {
    setTasks(assignmentService.getAssignments(selectedClass));
    const unsubAssignments = assignmentService.subscribe(() => {
      setTasks(assignmentService.getAssignments(selectedClass));
    });
    return unsubAssignments;
  }, [selectedClass]);

  const handleDaySelect = (index: number) => {
    scheduleService.setSelectedDayIndex(index);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalMode('add');
    setAddEditModalVisible(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalMode('edit');
    setAddEditModalVisible(true);
  };

  const handleSaveSchedule = (data: ScheduleFormData) => {
    if (modalMode === 'add') {
      scheduleService.addScheduleItem({
        dayIndex: data.dayIndex,
        title: data.title,
        lecturer: data.lecturer,
        room: data.room,
        time: data.time,
        timePeriod: data.timePeriod,
        duration: data.duration,
        timeRange: data.timeRange,
        endTime: data.endTime,
        reminderMinutes: data.reminderMinutes,
        headerColor: data.headerColor,
        cardColor: data.cardColor,
      });
    } else if (modalMode === 'edit' && editingItem) {
      scheduleService.updateScheduleItem({
        dayIndex: data.dayIndex,
        itemId: editingItem.id,
        title: data.title,
        lecturer: data.lecturer,
        room: data.room,
        time: data.time,
        timePeriod: data.timePeriod,
        duration: data.duration,
        timeRange: data.timeRange,
        endTime: data.endTime,
        reminderMinutes: data.reminderMinutes,
        headerColor: data.headerColor,
        cardColor: data.cardColor,
      });
    }
  };

  const handleDeleteSchedule = (dayIdx: number, itemId: string) => {
    scheduleService.deleteScheduleItem(dayIdx, itemId);
  };

  const handleSelectMonthYear = (newMonthYear: string) => {
    scheduleService.setSelectedMonthYear(newMonthYear);
  };

  const handleToggleCancelClass = (item: ScheduleItem) => {
    if (!canManageSchedule) {
      Alert.alert(
        'Akses Terbatas',
        'Hanya Class Manager atau Administrator yang berwenang membatalkan atau mengaktifkan kembali jadwal kuliah.'
      );
      return;
    }

    if (item.isCancelled) {
      Alert.alert(
        'Aktifkan Kembali Jadwal Kuliah?',
        `Apakah Anda yakin ingin mengaktifkan kembali sesi perkuliahan "${item.title}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ya, Aktifkan',
            onPress: async () => {
              await scheduleService.setScheduleItemCancelled(selectedDayIndex, item.id, false);
              await notificationService.sendLocalNotification(
                `Jadwal Diaktifkan Kembali: ${item.title}`,
                `Sesi perkuliahan ${item.title} telah diaktifkan kembali oleh Class Manager.`
              );
              Alert.alert('Sukses', 'Jadwal kuliah berhasil diaktifkan kembali.');
            },
          },
        ]
      );
    } else {
      setCancellingItem(item);
      setCancelReason('Dosen Berhalangan Hadir');
      setCustomCancelReason('');
      setCancelModalVisible(true);
    }
  };

  const handleConfirmCancelClass = async () => {
    if (!cancellingItem) return;

    const finalReason =
      cancelReason === 'Lainnya' && customCancelReason.trim()
        ? customCancelReason.trim()
        : cancelReason;

    const cancelledBy = user?.fullName || `Class Manager ${selectedClass}`;

    await scheduleService.setScheduleItemCancelled(
      selectedDayIndex,
      cancellingItem.id,
      true,
      finalReason,
      cancelledBy
    );

    const currentDay = weekSchedule[selectedDayIndex];
    await notificationService.sendLocalNotification(
      `Pemberitahuan Kelas Dibatalkan: ${cancellingItem.title}`,
      `Kuliah ${cancellingItem.title} (${cancellingItem.timeRange || cancellingItem.time + ' ' + cancellingItem.timePeriod}) pada hari ${currentDay?.dayName || 'ini'} ditiadakan oleh ${cancelledBy}. Alasan: ${finalReason}`
    );

    setCancelModalVisible(false);
    setCancellingItem(null);
    Alert.alert(
      'Jadwal Kuliah Dibatalkan',
      `Jadwal "${cancellingItem.title}" berhasil ditandai batal dan notifikasi broadcast telah dikirim ke perangkat mahasiswa kelas ${selectedClass}.`
    );
  };

  const handleOpenAddAssignment = () => {
    if (!canManageAssignments) {
      Alert.alert(
        'Akses Khusus Class Manager',
        'Hanya Class Manager atau Administrator yang berwenang menambahkan tugas resmi kelas.'
      );
      return;
    }
    setEditingTask(null);
    setAssignmentModalMode('add');
    setAssignmentModalVisible(true);
  };

  const handleOpenEditAssignment = (task: AssignmentTask) => {
    if (!canManageAssignments) {
      Alert.alert(
        'Akses Khusus Class Manager',
        'Hanya Class Manager atau Administrator yang berwenang mengedit tugas kelas.'
      );
      return;
    }
    setEditingTask(task);
    setAssignmentModalMode('edit');
    setAssignmentModalVisible(true);
  };

  const handleSaveAssignment = async (data: CreateAssignmentInput) => {
    if (assignmentModalMode === 'add') {
      const created = await assignmentService.addAssignment(data, user);
      await notificationService.sendLocalNotification(
        `Tugas Baru [${created.className}]: ${created.title}`,
        `Mata kuliah: ${created.courseName}. Deadline: ${created.deadlineDate} (${created.deadlineTime}).`
      );
      Alert.alert('Sukses', `Tugas "${created.title}" berhasil diterbitkan untuk kelas ${created.className}.`);
    } else if (assignmentModalMode === 'edit' && editingTask) {
      const updated = await assignmentService.updateAssignment(editingTask.id, data, user);
      Alert.alert('Sukses', `Tugas "${updated.title}" berhasil diperbarui.`);
    }
  };

  const handleDeleteAssignment = async (taskId: string) => {
    await assignmentService.deleteAssignment(taskId, user);
    Alert.alert('Sukses', 'Tugas berhasil dihapus.');
  };

  const handleToggleTaskCompleted = async (taskId: string) => {
    await assignmentService.toggleUserTaskCompleted(taskId);
  };

  const currentDay = weekSchedule[selectedDayIndex] || {
    dayName: 'Hari',
    dayNumber: '01',
    items: [],
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      taskSearchQuery.trim() === '' ||
      task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      task.courseName.toLowerCase().includes(taskSearchQuery.toLowerCase());

    const matchesPriority =
      taskPriorityFilter === 'Semua' || task.priority === taskPriorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.responsiveContainer}>
        <View style={[styles.topSegmentContainer, { paddingTop: topPadding + 6 }]}>
          <Pressable
            style={[styles.segmentBtn, activeTab === 'schedule' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === 'schedule' ? '#000000' : Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeTab === 'schedule' && styles.segmentBtnTextActive,
              ]}
            >
              Jadwal Kuliah
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, activeTab === 'assignments' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('assignments')}
          >
            <Ionicons
              name="clipboard"
              size={15}
              color={activeTab === 'assignments' ? '#000000' : Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeTab === 'assignments' && styles.segmentBtnTextActive,
              ]}
            >
              Jadwal Tugas ({selectedClass})
            </Text>
            {tasks.length > 0 && (
              <View
                style={[
                  styles.badgeCount,
                  activeTab === 'assignments' ? styles.badgeCountActive : styles.badgeCountInactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeCountText,
                    activeTab === 'assignments' ? styles.badgeCountTextActive : styles.badgeCountTextInactive,
                  ]}
                >
                  {tasks.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {activeTab === 'schedule' ? (
          <>
            <ScheduleCalendarHeader
              currentMonthYear={monthYear}
              days={weekSchedule}
              selectedIndex={selectedDayIndex}
              onDaySelected={handleDaySelect}
              onMonthDropdownTap={() => setMonthPickerVisible(true)}
              topPadding={0}
            />

            <View style={styles.actionHeaderBar}>
              <View style={styles.dayInfoCol}>
                <Text style={styles.dayInfoTitle}>
                  Jadwal {currentDay.dayName}, {currentDay.dayNumber} {monthYear.split(',')[0]}
                </Text>
                <Text style={styles.dayInfoSub}>
                  {currentDay.items.length} mata kuliah terdaftar
                </Text>
              </View>

              <View style={styles.actionHeaderButtons}>
                <Pressable style={styles.puisSyncBtn} onPress={() => setPuisModalVisible(true)}>
                  <Ionicons name="cloud-download-outline" size={14} color="#000000" />
                  <Text style={styles.puisSyncBtnText}>Tarik PUIS</Text>
                </Pressable>

                <Pressable style={styles.addScheduleBtn} onPress={handleAddNew}>
                  <Ionicons name="add" size={16} color="#000000" />
                  <Text style={styles.addScheduleBtnText}>Tambah</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.timelineContent}
              showsVerticalScrollIndicator={true}
            >
              {currentDay.items.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={54} color="rgba(255,255,255,0.2)" />
                  <Text style={styles.emptyTitle}>Tidak Ada Jadwal Kuliah</Text>
                  <Text style={styles.emptySubtitle}>
                    Hari {currentDay.dayName} ini belum ada agenda kuliah aktif.
                  </Text>
                  <Pressable style={styles.emptyAddBtn} onPress={handleAddNew}>
                    <Ionicons name="add-circle-outline" size={18} color={Colors.accentYellow} />
                    <Text style={styles.emptyAddBtnText}>Tambah Jadwal Hari Ini</Text>
                  </Pressable>
                </View>
              ) : (
                currentDay.items.map((item) => (
                  <ScheduleTimelineCard
                    key={item.id}
                    item={item}
                    canManage={canManageSchedule}
                    onMorePressed={() => handleEditItem(item)}
                    onToggleCancel={() => handleToggleCancelClass(item)}
                  />
                ))
              )}
            </ScrollView>
          </>
        ) : (

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.assignmentContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.classChipsContainer}>
              <Text style={styles.classChipsLabel}>PILIH KELAS:</Text>
              <View style={styles.classChipsRow}>
                {AVAILABLE_CLASSES.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.classChip, selectedClass === c && styles.classChipActive]}
                    onPress={() => setSelectedClass(c)}
                  >
                    <Text style={[styles.classChipText, selectedClass === c && styles.classChipTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.assignmentHeaderBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignmentHeaderTitle}>
                  Tugas Kuliah Kelas {selectedClass}
                </Text>
                <Text style={styles.assignmentHeaderSub}>
                  {canManageAssignments
                    ? (isClassManager ? 'Hak Kelola Class Manager Aktif' : 'Akses Administrator')
                    : `Dikelola oleh Class Manager ${selectedClass}`}
                </Text>
              </View>

              {canManageAssignments ? (
                <Pressable style={styles.addAssignmentBtn} onPress={handleOpenAddAssignment}>
                  <Ionicons name="add" size={16} color="#000000" />
                  <Text style={styles.addAssignmentBtnText}>Buat Tugas</Text>
                </Pressable>
              ) : (
                <View style={styles.studentBadge}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#4ADE80" style={{ marginRight: 4 }} />
                  <Text style={styles.studentBadgeText}>Mahasiswa {selectedClass}</Text>
                </View>
              )}
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={17} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Cari tugas ${selectedClass}...`}
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={taskSearchQuery}
                onChangeText={setTaskSearchQuery}
              />
              {taskSearchQuery ? (
                <Pressable onPress={() => setTaskSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filterPillsRow}>
              {['Semua', 'high', 'medium', 'normal'].map((p) => (
                <Pressable
                  key={p}
                  style={[styles.filterPill, taskPriorityFilter === p && styles.filterPillActive]}
                  onPress={() => setTaskPriorityFilter(p)}
                >
                  <Text style={[styles.filterPillText, taskPriorityFilter === p && styles.filterPillTextActive]}>
                    {p === 'Semua' ? 'Semua Prioritas' : p === 'high' ? 'Penting' : p === 'medium' ? 'Sedang' : 'Normal'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredTasks.length === 0 ? (
              <View style={styles.emptyAssignmentCard}>
                <Ionicons name="checkmark-done-circle-outline" size={54} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>Tidak Ada Tugas di Kelas {selectedClass}</Text>
                <Text style={styles.emptySubtitle}>
                  {canManageAssignments
                    ? 'Ketuk tombol "+ Buat Tugas" untuk membagikan tugas baru kepada mahasiswa kelas ini.'
                    : `Belum ada tugas aktif yang diunggah oleh Class Manager ${selectedClass}.`}
                </Text>
                {canManageAssignments && (
                  <Pressable style={styles.emptyAddBtn} onPress={handleOpenAddAssignment}>
                    <Ionicons name="add-circle-outline" size={18} color={Colors.accentYellow} />
                    <Text style={styles.emptyAddBtnText}>Buat Tugas Pertama</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredTasks.map((task) => (
                <AssignmentCard
                  key={task.id}
                  task={task}
                  isCompleted={assignmentService.isTaskCompletedByUser(task.id)}
                  canManage={canManageAssignments}
                  onToggleComplete={handleToggleTaskCompleted}
                  onEdit={handleOpenEditAssignment}
                  onDelete={handleDeleteAssignment}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <MonthPickerModal
        visible={monthPickerVisible}
        currentMonthYear={monthYear}
        onClose={() => setMonthPickerVisible(false)}
        onSelect={handleSelectMonthYear}
      />

      <AddEditScheduleModal
        visible={addEditModalVisible}
        mode={modalMode}
        initialDayIndex={selectedDayIndex}
        initialItem={editingItem}
        onClose={() => setAddEditModalVisible(false)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
      />

      <AddEditAssignmentModal
        visible={assignmentModalVisible}
        mode={assignmentModalMode}
        initialItem={editingTask}
        defaultClassName={selectedClass}
        onClose={() => setAssignmentModalVisible(false)}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteAssignment}
      />

      <Modal visible={puisModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.puisIconBox}>
                <Ionicons name="school" size={22} color={Colors.accentYellow} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modalHeaderTitle}>Tarik Jadwal dari PUIS</Text>
                <Text style={styles.modalHeaderSub}>President University Information System</Text>
              </View>
            </View>

            <View style={styles.puisClassTag}>
              <Ionicons name="information-circle" size={16} color="#38BDF8" style={{ marginRight: 6 }} />
              <Text style={styles.puisClassTagText}>
                Target Sinkronisasi: Kelas {selectedClass} (IT 2026 CLASS 1)
              </Text>
            </View>

            <Text style={styles.modalFieldLabel}>Email / Student ID PUIS</Text>
            <View style={styles.modalInputBox}>
              <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                value={puisEmail}
                onChangeText={setPuisEmail}
                placeholder="nama@student.president.ac.id"
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.modalFieldLabel, { marginTop: 10 }]}>Password Akun PUIS</Text>
            <View style={styles.modalInputBox}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                value={puisPassword}
                onChangeText={setPuisPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
              />
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setPuisModalVisible(false)}
                disabled={isSyncingPuis}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </Pressable>

              <Pressable
                style={[styles.modalConfirmBtn, isSyncingPuis && { opacity: 0.6 }]}
                onPress={handleSyncPuis}
                disabled={isSyncingPuis}
              >
                {isSyncingPuis ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-download" size={16} color="#000000" style={{ marginRight: 4 }} />
                    <Text style={styles.modalConfirmBtnText}>Tarik Jadwal</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.puisIconBox,
                  { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },
                ]}
              >
                <Ionicons name="alert-circle" size={22} color="#F87171" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modalHeaderTitle}>Batalkan Jadwal Kuliah</Text>
                <Text style={styles.modalHeaderSub}>
                  {cancellingItem?.title} ({cancellingItem?.room})
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.puisClassTag,
                { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
              ]}
            >
              <Ionicons name="information-circle" size={16} color="#F87171" style={{ marginRight: 6 }} />
              <Text style={[styles.puisClassTagText, { color: '#FCA5A5' }]}>
                Status pembatalan ini akan diumumkan ke seluruh mahasiswa kelas {selectedClass}.
              </Text>
            </View>

            <Text style={styles.modalFieldLabel}>PILIH ALASAN PEMBATALAN:</Text>
            <View style={{ gap: 8, marginBottom: 12 }}>
              {[
                'Dosen Berhalangan Hadir',
                'Dosen Sedang Sakit / Cuti',
                'Kelas Diganti Tugas Mandiri',
                'Jadwal Kuliah Reschedule / Pindah Jam',
                'Lainnya',
              ].map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.cancelReasonOption,
                    cancelReason === reason && styles.cancelReasonOptionActive,
                  ]}
                  onPress={() => setCancelReason(reason)}
                >
                  <Ionicons
                    name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={cancelReason === reason ? Colors.accentYellow : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.cancelReasonText,
                      cancelReason === reason && styles.cancelReasonTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </Pressable>
              ))}
            </View>

            {cancelReason === 'Lainnya' && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.modalFieldLabel}>TULISKAN ALASAN SPESIFIK:</Text>
                <View style={styles.modalInputBox}>
                  <TextInput
                    style={styles.modalInput}
                    value={customCancelReason}
                    onChangeText={setCustomCancelReason}
                    placeholder="Contoh: Diganti pertemuan daring via Zoom"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Kembali</Text>
              </Pressable>

              <Pressable
                style={[styles.modalConfirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleConfirmCancelClass}
              >
                <Ionicons name="close-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={[styles.modalConfirmBtnText, { color: '#FFFFFF' }]}>
                  Konfirmasi Batalkan
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    backgroundColor: '#191A1E',
  },
  responsiveContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  topSegmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#191A1E',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101726',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  segmentBtnActive: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  badgeCount: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeCountActive: {
    backgroundColor: '#000000',
  },
  badgeCountInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeCountTextActive: {
    color: Colors.accentYellow,
  },
  badgeCountTextInactive: {
    color: Colors.textSecondary,
  },
  actionHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  dayInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  dayInfoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  dayInfoSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  actionHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  puisSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  puisSyncBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addScheduleBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
    height: '100%',
  },
  timelineContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    flexGrow: 1,
  },
  assignmentContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
    flexGrow: 1,
  },
  classChipsContainer: {
    marginBottom: 12,
  },
  classChipsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  classChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  classChip: {
    flex: 1,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  classChipActive: {
    backgroundColor: '#0C389E',
    borderColor: '#38BDF8',
  },
  classChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  classChipTextActive: {
    color: '#FFFFFF',
  },
  assignmentHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  assignmentHeaderSub: {
    fontSize: 11,
    color: Colors.accentYellow,
    marginTop: 2,
    fontWeight: '600',
  },
  addAssignmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addAssignmentBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  studentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textWhite,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#101726',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: '#0C389E',
    borderColor: '#38BDF8',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyAssignmentCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#101726',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginTop: 4,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
  },
  emptyAddBtnText: {
    color: Colors.accentYellow,
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#0F1626',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  puisIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.4)',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  puisClassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  puisClassTagText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    flex: 1,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 4,
  },
  modalInput: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  modalCancelBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.accentYellow,
  },
  modalConfirmBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelReasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  cancelReasonOptionActive: {
    borderColor: Colors.accentYellow,
    backgroundColor: 'rgba(247, 206, 69, 0.08)',
  },
  cancelReasonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cancelReasonTextActive: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
});
