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

      // Strict President University email check
      const emailValidation = validateStudentEmail(email);
      if (!emailValidation.isValid) {
        setErrorMessage(emailValidation.error || 'Email tidak valid.');
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
      // Login mode
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
        {/* App Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={32} color={Colors.accentYellow} />
          </View>
          <Text style={styles.appTitle}>CampusLife</Text>
          <Text style={styles.appSubtitle}>President University Student Portal</Text>

          {/* Database Live Status Badge */}
          <View style={styles.dbIndicator}>
            <View style={styles.dbDot} />
            <Text style={styles.dbText}>Database: Terhubung ke Supabase Cloud</Text>
            <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
          </View>
        </View>

        {/* Tab Switch: Masuk / Daftar */}
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

        {/* Notice for registration restriction */}
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

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Helper Card for Ready-to-Test Credentials */}
        {!isRegisterMode && (
          <View style={styles.testAccountCard}>
            <View style={styles.testAccountHeader}>
              <Ionicons name="key" size={14} color={Colors.accentYellow} />
              <Text style={styles.testAccountTitle}>Kredensial Akun (Klik untuk Isi Otomatis)</Text>
            </View>
            <View style={styles.testAccountChipsRow}>
              <Pressable
                style={styles.accountChipAdmin}
                onPress={() => {
                  setEmail('admin@campuslife.com');
                  setPassword('admin123');
                  setErrorMessage('');
                }}
              >
                <Ionicons name="shield-checkmark" size={16} color="#FACC15" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.accountChipRoleAdmin}>👑 Akun Admin (CRUD UMKM)</Text>
                  <Text style={styles.accountChipEmail}>admin@campuslife.com • sandi: admin123</Text>
                </View>
                <View style={styles.fillBadge}>
                  <Text style={styles.fillBadgeText}>Isi</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.accountChipStudent}
                onPress={() => {
                  setEmail('mahasiswa@student.president.ac.id');
                  setPassword('student123');
                  setErrorMessage('');
                }}
              >
                <Ionicons name="school" size={16} color="#60A5FA" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.accountChipRoleStudent}>🎓 Akun Mahasiswa (Jadwal & Dompet)</Text>
                  <Text style={styles.accountChipEmail}>mahasiswa@student... • sandi: student123</Text>
                </View>
                <View style={styles.fillBadge}>
                  <Text style={styles.fillBadgeText}>Isi</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.formCard}>
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
            {isRegisterMode && (
              <Text style={styles.fieldHint}>
                *Domain wajib: @student.president.ac.id
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

          {/* Submit Button */}
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

        {/* Quick Demo Login Options */}
        <View style={styles.demoSection}>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU MASUK CEPAT (UJI COBA)</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoButtonsRow}>
            <Pressable
              style={styles.demoButtonStudent}
              onPress={() => quickLogin('user')}
            >
              <Ionicons name="person" size={16} color="#FFFFFF" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.demoButtonTitle}>Akun Mahasiswa</Text>
                <Text style={styles.demoButtonSub}>Jadwal, Keuangan, UMKM</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.demoButtonAdmin}
              onPress={() => quickLogin('admin')}
            >
              <Ionicons name="shield" size={16} color="#000000" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.demoButtonAdminTitle}>Akun Admin</Text>
                <Text style={styles.demoButtonAdminSub}>CRUD UMKM & User</Text>
              </View>
            </Pressable>
          </View>
        </View>
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
  dbIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginTop: 10,
  },
  dbDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  dbText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ADE80',
    marginRight: 6,
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
  testAccountCard: {
    backgroundColor: '#0D1424',
    borderWidth: 1,
    borderColor: '#1F2E4D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  testAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  testAccountTitle: {
    color: Colors.accentYellow,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  testAccountChipsRow: {
    gap: 8,
  },
  accountChipAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  accountChipRoleAdmin: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
  },
  accountChipStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  accountChipRoleStudent: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
  },
  accountChipEmail: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  fillBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fillBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    gap: 10,
  },
  demoButtonStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162238',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3C5E',
  },
  demoButtonTitle: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  demoButtonSub: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  demoButtonAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    padding: 12,
    borderRadius: 12,
  },
  demoButtonAdminTitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  demoButtonAdminSub: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
});
