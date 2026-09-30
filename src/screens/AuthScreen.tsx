import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { validateStudentEmail, STUDENT_EMAIL_DOMAIN } from '../utils/authValidators';

export const AuthScreen: React.FC = () => {
  const { login, register, quickLogin, isLoading } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const trimmedEmail = email.trim().toLowerCase();
  const isInvalidDomain =
    isRegisterMode && trimmedEmail.includes('@') && !trimmedEmail.endsWith('@student.president.ac.id');
  const isValidStudentDomain =
    isRegisterMode &&
    trimmedEmail.endsWith('@student.president.ac.id') &&
    trimmedEmail.length > '@student.president.ac.id'.length;
  const canAppendDomain =
    isRegisterMode && trimmedEmail.length > 0 && !trimmedEmail.includes('@');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }

      const emailValidation = validateStudentEmail(email);
      if (!emailValidation.isValid) {
        setErrorMessage(
          emailValidation.error ||
            'Pendaftaran ditolak: Sistem registrasi CampusLife hanya menerima email resmi mahasiswa @student.president.ac.id.'
        );
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      try {
        await register(email, password, fullName);
      } catch (err: any) {
        setErrorMessage(err.message || 'Pendaftaran gagal.');
      }
    } else {

      try {
        await login(email, password);
      } catch (err: any) {
        setErrorMessage(err.message || 'Gagal masuk. Periksa email & kata sandi.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={32} color={Colors.accentYellow} />
          </View>
          <Text style={styles.appTitle}>CampusLife</Text>
          <Text style={styles.appSubtitle}>President University Student Portal</Text>

        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, !isRegisterMode && styles.activeTabButton]}
            onPress={() => {
              setIsRegisterMode(false);
              setErrorMessage('');
            }}
          >
            <Text style={[styles.tabText, !isRegisterMode && styles.activeTabText]}>
              Masuk
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, isRegisterMode && styles.activeTabButton]}
            onPress={() => {
              setIsRegisterMode(true);
              setErrorMessage('');
            }}
          >
            <Text style={[styles.tabText, isRegisterMode && styles.activeTabText]}>
              Daftar Mahasiswa
            </Text>
          </Pressable>
        </View>

        {isRegisterMode && (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={20} color={Colors.accentYellow} />
            <Text style={styles.noticeText}>
              Pendaftaran khusus mahasiswa aktif President University. Gunakan email{' '}
              <Text style={{ fontWeight: '800', color: Colors.accentYellow }}>
                {STUDENT_EMAIL_DOMAIN}
              </Text>
            </Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formCard}>
          {isRegisterMode && (
            <View style={styles.studentNoticeBox}>
              <Ionicons name="school-outline" size={20} color={Colors.accentYellow} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.studentNoticeTitle}>Pendaftaran Khusus Mahasiswa</Text>
                <Text style={styles.studentNoticeSub}>
                  Sistem registrasi HANYA menerima akun mahasiswa resmi President University (@student.president.ac.id).
                </Text>
              </View>
            </View>
          )}

          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Derrian Kalalo"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isRegisterMode ? 'Email Mahasiswa (@student.president.ac.id)' : 'Email'}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={
                  isRegisterMode
                    ? 'nama@student.president.ac.id'
                    : 'Email mahasiswa atau admin'
                }
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {isRegisterMode && isInvalidDomain && (
              <View style={styles.domainErrorPill}>
                <Ionicons name="close-circle" size={14} color="#EF4444" />
                <Text style={styles.domainErrorText}>
                  Domain ditolak. Hanya email @student.president.ac.id yang diizinkan mendaftar.
                </Text>
              </View>
            )}

            {isRegisterMode && isValidStudentDomain && (
              <View style={styles.domainSuccessPill}>
                <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                <Text style={styles.domainSuccessText}>
                  Domain @student.president.ac.id terverifikasi valid
                </Text>
              </View>
            )}

            {canAppendDomain && (
              <Pressable
                style={styles.appendDomainChip}
                onPress={() => setEmail(trimmedEmail + '@student.president.ac.id')}
              >
                <Ionicons name="add" size={12} color={Colors.accentYellow} />
                <Text style={styles.appendDomainText}>Pasang @student.president.ac.id</Text>
              </Pressable>
            )}

            {isRegisterMode && !isInvalidDomain && !isValidStudentDomain && !canAppendDomain && (
              <Text style={styles.fieldHint}>
                *Wajib: Hanya menerima email resmi @student.president.ac.id
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi kata sandi"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>
          )}

          <Pressable
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegisterMode ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
              </Text>
            )}
          </Pressable>
        </View>

        {!isRegisterMode && (
          <View style={styles.demoSection}>
            <View style={styles.demoDividerRow}>
              <View style={styles.demoDividerLine} />
              <Text style={styles.demoDividerText}>AKUN DEMO PENGUJIAN</Text>
              <View style={styles.demoDividerLine} />
            </View>

            <View style={styles.demoButtonsContainer}>
              <Pressable
                style={[styles.demoCard, { borderColor: '#55A4B2' }]}
                onPress={() => quickLogin('user')}
                disabled={isLoading}
              >
                <Ionicons name="person" size={16} color="#55A4B2" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.demoCardTitle}>Mahasiswa (IT 1)</Text>
                  <Text style={styles.demoCardSub}>Lihat jadwal & ceklist tugas kelas</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>

              <Pressable
                style={[styles.demoCard, { borderColor: '#A380FF' }]}
                onPress={() => quickLogin('class_manager')}
                disabled={isLoading}
              >
                <Ionicons name="briefcase" size={16} color="#A380FF" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={[styles.demoCardTitle, { color: '#C4B5FD' }]}>Class Manager (IT 1)</Text>
                  <Text style={styles.demoCardSub}>Buat & kelola tugas kuliah IT 1</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>

              <Pressable
                style={[styles.demoCard, { borderColor: Colors.accentYellow }]}
                onPress={() => quickLogin('admin')}
                disabled={isLoading}
              >
                <Ionicons name="shield-checkmark" size={16} color={Colors.accentYellow} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={[styles.demoCardTitle, { color: Colors.accentYellow }]}>Administrator</Text>
                  <Text style={styles.demoCardSub}>Akses penuh dashboard sistem</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#162238',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(247, 206, 69, 0.4)',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textWhite,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#121826',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: Colors.accentYellow,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '800',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 206, 69, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    color: '#E0E0E0',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF8080',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#0F1626',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D283E',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B0B8C8',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.accentYellow,
    marginTop: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070A13',
    borderWidth: 1,
    borderColor: '#24324D',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 14,
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: Colors.accentYellow,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 20,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  demoDividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoButtonsContainer: {
    gap: 8,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  demoCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  demoCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  studentNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 206, 69, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  studentNoticeTitle: {
    color: Colors.accentYellow,
    fontSize: 12,
    fontWeight: '800',
  },
  studentNoticeSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  domainErrorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
    gap: 6,
  },
  domainErrorText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  domainSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
    gap: 6,
  },
  domainSuccessText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  appendDomainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247, 206, 69, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(247, 206, 69, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    gap: 4,
  },
  appendDomainText: {
    color: Colors.accentYellow,
    fontSize: 11,
    fontWeight: '700',
  },
});
