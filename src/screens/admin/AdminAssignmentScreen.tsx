import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { assignmentService, AVAILABLE_CLASSES, CreateAssignmentInput } from '../../services/assignmentService';
import { AssignmentTask, TaskPriority } from '../../models/assignment';
import { AssignmentCard } from '../../components/schedule/AssignmentCard';
import { AddEditAssignmentModal } from '../../components/schedule/AddEditAssignmentModal';
import { notificationService } from '../../services/notificationService';

export const AdminAssignmentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 16);
  const { user, canManageAssignments, isClassManager, isAdmin } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>(user?.managedClass || 'IT 1');
  const [tasks, setTasks] = useState<AssignmentTask[]>(assignmentService.getAssignments(selectedClass));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('Semua');

  // Modal State
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingTask, setEditingTask] = useState<AssignmentTask | null>(null);
  const [isSyncingPuis, setIsSyncingPuis] = useState<boolean>(false);

  const handleSyncFromPuis = async () => {
    setIsSyncingPuis(true);
    try {
      const added = await assignmentService.syncAssignmentsFromPuisCourses(selectedClass, user);
      if (added > 0) {
        await notificationService.sendLocalNotification(
          `Sinkronisasi Tugas PUIS (${selectedClass})`,
          `Sebanyak ${added} tugas baru untuk mata kuliah PUIS berhasil diselaraskan ke kelas ${selectedClass}.`
        );
        Alert.alert(
          'Sinkronisasi Tugas Berhasil',
          `Berhasil menyelaraskan tugas dengan jadwal resmi PUIS. Menambahkan ${added} tugas silabus baru untuk kelas ${selectedClass}.`
        );
      } else {
        Alert.alert(
          'Informasi',
          `Seluruh mata kuliah resmi PUIS untuk kelas ${selectedClass} sudah memiliki jadwal tugas aktif.`
        );
      }
    } catch (e: any) {
      Alert.alert('Gagal Sinkronisasi', e.message || 'Terjadi kesalahan.');
    } finally {
      setIsSyncingPuis(false);
    }
  };

  useEffect(() => {
    setTasks(assignmentService.getAssignments(selectedClass));
    const unsubscribe = assignmentService.subscribe(() => {
      setTasks(assignmentService.getAssignments(selectedClass));
    });
    return unsubscribe;
  }, [selectedClass]);

  const handleOpenAdd = () => {
    if (!canManageAssignments) {
      Alert.alert(
        'Akses Terbatas',
        'Hanya Class Manager atau Administrator yang berwenang menambahkan tugas kelas.'
      );
      return;
    }
    setEditingTask(null);
    setModalMode('add');
    setModalVisible(true);
  };

  const handleOpenEdit = (task: AssignmentTask) => {
    if (!canManageAssignments) {
      Alert.alert('Akses Terbatas', 'Hanya Class Manager yang berwenang mengedit tugas.');
      return;
    }
    setEditingTask(task);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleSaveAssignment = async (data: CreateAssignmentInput) => {
    if (modalMode === 'add') {
      const created = await assignmentService.addAssignment(data, user);
      // Kirim notifikasi broadcast sistem ke mahasiswa
      await notificationService.sendLocalNotification(
        `Tugas Baru [${created.className}]: ${created.title}`,
        `Mata kuliah: ${created.courseName}. Deadline: ${created.deadlineDate} (${created.deadlineTime}).`
      );
      Alert.alert(
        'Sukses Menambahkan Tugas',
        `Tugas "${created.title}" untuk kelas ${created.className} berhasil diterbitkan dan notifikasi telah dikirim ke perangkat mahasiswa.`
      );
    } else if (modalMode === 'edit' && editingTask) {
      const updated = await assignmentService.updateAssignment(editingTask.id, data, user);
      Alert.alert('Sukses', `Perubahan tugas "${updated.title}" berhasil disimpan.`);
    }
  };

  const handleDeleteAssignment = async (taskId: string) => {
    await assignmentService.deleteAssignment(taskId, user);
    Alert.alert('Sukses', 'Tugas berhasil dihapus dari jadwal kelas.');
  };

  const handleToggleComplete = async (taskId: string) => {
    await assignmentService.toggleUserTaskCompleted(taskId);
  };

  const handleBroadcastReminder = async () => {
    const activeTasks = tasks.filter((t) => t.className === selectedClass);
    if (activeTasks.length === 0) {
      Alert.alert('Info', `Belum ada tugas aktif untuk kelas ${selectedClass}.`);
      return;
    }

    const firstTask = activeTasks[0];
    await notificationService.sendLocalNotification(
      `Pengingat Tugas Kelas ${selectedClass}`,
      `Perhatian mahasiswa ${selectedClass}: Ada ${activeTasks.length} tugas aktif. Tugas terdekat: "${firstTask.title}" (${firstTask.deadlineDate}).`
    );

    Alert.alert(
      'Notifikasi Massal Terkirim',
      `Pemberitahuan pengingat tugas kelas ${selectedClass} berhasil disiarkan ke bilah status HP mahasiswa.`
    );
  };

  // Filter list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      filterPriority === 'Semua' || task.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;

  if (!canManageAssignments) {
    return (
      <View style={[styles.container, { paddingTop: topPadding, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={styles.deniedTitle}>Akses Khusus Class Manager</Text>
        <Text style={styles.deniedText}>
          Halaman ini khusus untuk Class Manager (Ketua Kelas) dan Administrator. Akun Anda saat ini terdaftar sebagai Mahasiswa biasa.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeIcon}>
            <Ionicons name="briefcase" size={20} color={Colors.accentYellow} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Dashboard Tugas Kelas</Text>
            <Text style={styles.headerSubtitle}>
              {isAdmin ? 'Mode Administrator' : `Class Manager ${user?.managedClass || selectedClass}`}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={[styles.syncPuisBtn, isSyncingPuis && { opacity: 0.6 }]}
            onPress={handleSyncFromPuis}
            disabled={isSyncingPuis}
          >
            <Ionicons name="cloud-download-outline" size={14} color="#000000" />
            <Text style={styles.syncPuisBtnText}>Tarik PUIS</Text>
          </Pressable>

          <Pressable style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={18} color="#000000" />
            <Text style={styles.addBtnText}>Buat Tugas</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Class Selector Bar */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>KELAS DIKELOLA</Text>
              <View style={styles.roleTag}>
                <Ionicons name="shield-checkmark" size={12} color="#4ADE80" style={{ marginRight: 4 }} />
                <Text style={styles.roleTagText}>Hak Akses: Class Manager</Text>
              </View>
            </View>

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

            {/* Metrics Overview Cards */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { borderColor: '#38BDF8' }]}>
                <Text style={styles.metricNumber}>{tasks.length}</Text>
                <Text style={styles.metricLabel}>Total Tugas {selectedClass}</Text>
              </View>

              <View style={[styles.metricCard, { borderColor: '#EF4444' }]}>
                <Text style={[styles.metricNumber, { color: '#EF4444' }]}>{highPriorityCount}</Text>
                <Text style={styles.metricLabel}>Prioritas Tinggi</Text>
              </View>
            </View>

            {/* Broadcast Button */}
            <Pressable style={styles.broadcastBtn} onPress={handleBroadcastReminder}>
              <Ionicons name="notifications" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.broadcastBtnText}>
                Kirim Notifikasi Pengingat Tugas ke HP Mahasiswa ({selectedClass})
              </Text>
            </Pressable>

            {/* Search and Filter */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Cari tugas ${selectedClass}...`}
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            {/* Priority Filter */}
            <View style={styles.filterPillsRow}>
              {['Semua', 'high', 'medium', 'normal'].map((p) => (
                <Pressable
                  key={p}
                  style={[styles.filterPill, filterPriority === p && styles.filterPillActive]}
                  onPress={() => setFilterPriority(p)}
                >
                  <Text style={[styles.filterPillText, filterPriority === p && styles.filterPillTextActive]}>
                    {p === 'Semua' ? 'Semua' : p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Normal'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.listSectionTitle}>
              DAFTAR TUGAS KELAS {selectedClass.toUpperCase()} ({filteredTasks.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AssignmentCard
            task={item}
            isCompleted={assignmentService.isTaskCompletedByUser(item.id)}
            canManage={true}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteAssignment}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Belum Ada Tugas di Kelas {selectedClass}</Text>
            <Text style={styles.emptyDesc}>
              Ketuk tombol "Buat Tugas" di atas untuk menambahkan tugas kuliah baru bagi mahasiswa kelas ini.
            </Text>
          </View>
        }
      />

      {/* Add / Edit Assignment Modal */}
      <AddEditAssignmentModal
        visible={modalVisible}
        mode={modalMode}
        initialItem={editingTask}
        defaultClassName={selectedClass}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteAssignment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2338',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#162238',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.4)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.accentYellow,
    fontWeight: '600',
    marginTop: 2,
  },
  syncPuisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  syncPuisBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
  },
  classChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  classChip: {
    flex: 1,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 9,
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#101726',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentYellow,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  broadcastBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101726',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textWhite,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#101726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  listSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#101726',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textWhite,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  deniedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
