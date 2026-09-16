import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { UserProfile, UserRole } from '../../services/authService';
import { adminUserService } from '../../services/adminUserService';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 16);
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>(adminUserService.getUsers());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reset password modal state
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Edit user modal state
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  useEffect(() => {
    adminUserService.fetchUsers().then(setUsers).catch(() => {});
    const unsub = adminUserService.subscribe(() => {
      setUsers(adminUserService.getUsers());
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q);
  });

  const openResetModal = (u: UserProfile) => {
    setSelectedUser(u);
    setNewPassword('');
    setResetModalVisible(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Peringatan', 'Kata sandi baru minimal 6 karakter.');
      return;
    }

    setIsResetting(true);
    try {
      const result = await adminUserService.resetPassword(selectedUser.id, newPassword);
      Alert.alert('Sukses', result.message || `Password untuk ${selectedUser.email} berhasil direset.`);
      setResetModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal mereset kata sandi.');
    } finally {
      setIsResetting(false);
    }
  };

  const openEditModal = (u: UserProfile) => {
    setSelectedUser(u);
    setEditFullName(u.fullName);
    setEditRole(u.role);
    setEditModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    if (!editFullName.trim()) {
      Alert.alert('Peringatan', 'Nama lengkap wajib diisi.');
      return;
    }

    setIsSavingUser(true);
    try {
      await adminUserService.updateUser(selectedUser.id, {
        fullName: editFullName.trim(),
        role: editRole,
      });
      Alert.alert('Sukses', 'Data pengguna berhasil diperbarui.');
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memperbarui pengguna.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = (u: UserProfile) => {
    if (u.id === currentAdmin?.id) {
      Alert.alert('Aksi Ditolak', 'Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    Alert.alert(
      'Hapus Pengguna',
      `Apakah Anda yakin ingin menghapus akun "${u.email}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Akun',
          style: 'destructive',
          onPress: async () => {
            await adminUserService.deleteUser(u.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
          <Text style={styles.headerSub}>Kelola role mahasiswa & reset kata sandi</Text>
        </View>
        <View style={styles.userCountBadge}>
          <Text style={styles.userCountText}>{users.length} User</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email mahasiswa..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isCurrentUser = item.id === currentAdmin?.id;
          const isAdminRole = item.role === 'admin';

          return (
            <View style={styles.userCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
                    {isCurrentUser && (
                      <View style={styles.selfBadge}>
                        <Text style={styles.selfBadgeText}>Anda</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                </View>
                <View style={[styles.roleBadge, isAdminRole ? styles.roleAdmin : styles.roleUser]}>
                  <Text style={[styles.roleBadgeText, isAdminRole ? styles.roleAdminText : styles.roleUserText]}>
                    {isAdminRole ? 'ADMIN' : 'MAHASISWA'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Reset Password & Edit & Delete */}
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => openResetModal(item)}
                >
                  <Ionicons name="key-outline" size={14} color={Colors.accentYellow} />
                  <Text style={styles.resetBtnText}>Reset Password</Text>
                </Pressable>

                <Pressable
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil-outline" size={14} color="#55A4B2" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>

                {!isCurrentUser && (
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUser(item)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Reset Password Modal */}
      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="key" size={20} color={Colors.accentYellow} />
              </View>
              <Text style={styles.modalTitle}>Reset Kata Sandi</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Atur ulang kata sandi untuk akun:{'\n'}
              <Text style={{ fontWeight: '800', color: Colors.textWhite }}>
                {selectedUser?.email}
              </Text>
            </Text>

            <Text style={styles.inputLabel}>Kata Sandi Baru (Minimal 6 Karakter)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Masukkan password baru..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, isResetting && { opacity: 0.6 }]}
                onPress={handleResetPassword}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.confirmBtnText}>Simpan Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: '#182C3D' }]}>
                <Ionicons name="person" size={20} color="#55A4B2" />
              </View>
              <Text style={styles.modalTitle}>Edit Data Pengguna</Text>
            </View>

            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.modalInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Nama Mahasiswa"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Peran Akun (Role)</Text>
            <View style={styles.roleSelectRow}>
              <Pressable
                style={[
                  styles.roleOption,
                  editRole === 'user' && styles.roleOptionActive,
                ]}
                onPress={() => setEditRole('user')}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    editRole === 'user' && styles.roleOptionTextActive,
                  ]}
                >
                  Mahasiswa (User)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleOption,
                  editRole === 'admin' && styles.roleOptionActiveAdmin,
                ]}
                onPress={() => setEditRole('admin')}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    editRole === 'admin' && styles.roleOptionTextActiveAdmin,
                  ]}
                >
                  Administrator
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, isSavingUser && { opacity: 0.6 }]}
                onPress={handleSaveUser}
                disabled={isSavingUser}
              >
                {isSavingUser ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.confirmBtnText}>Perbarui</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userCountBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userCountText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#1E2B45',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 13,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  userCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3C5E',
  },
  avatarText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  selfBadge: {
    backgroundColor: 'rgba(247, 206, 69, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  selfBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accentYellow,
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  roleAdmin: {
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
    borderWidth: 1,
    borderColor: Colors.accentYellow,
  },
  roleAdminText: {
    color: Colors.accentYellow,
    fontSize: 9,
    fontWeight: '900',
  },
  roleUser: {
    backgroundColor: 'rgba(85, 164, 178, 0.15)',
    borderWidth: 1,
    borderColor: '#55A4B2',
  },
  roleUserText: {
    color: '#55A4B2',
    fontSize: 9,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#172238',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 206, 69, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentYellow,
    marginLeft: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 164, 178, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#55A4B2',
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    padding: 6,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0F1626',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#24324D',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.textWhite,
    fontSize: 13,
  },
  roleSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#24324D',
  },
  roleOptionActive: {
    backgroundColor: '#55A4B2',
    borderColor: '#55A4B2',
  },
  roleOptionActiveAdmin: {
    backgroundColor: Colors.accentYellow,
    borderColor: Colors.accentYellow,
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleOptionTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  roleOptionTextActiveAdmin: {
    color: '#000000',
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  cancelBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.accentYellow,
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
