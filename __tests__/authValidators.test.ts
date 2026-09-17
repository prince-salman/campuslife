import {
  validateStudentEmail,
  validatePassword,
  validateFullName,
  STUDENT_EMAIL_DOMAIN,
} from '../src/utils/authValidators';

describe('authValidators', () => {
  describe('validateStudentEmail', () => {
    it('should accept valid President University student email', () => {
      const validEmails = [
        'derrian.kalalo@student.president.ac.id',
        'john.doe2023@student.president.ac.id',
        'student_01@student.president.ac.id',
      ];

      validEmails.forEach((email) => {
        const result = validateStudentEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject non-student domains like gmail, yahoo, or wrong domain', () => {
      const invalidEmails = [
        'user@gmail.com',
        'student@yahoo.co.id',
        'admin@president.ac.id', // faculty/staff domain, not student
        'someone@student.ui.ac.id',
        'random@outlook.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateStudentEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(STUDENT_EMAIL_DOMAIN);
      });
    });

    it('should reject empty or malformed emails', () => {
      expect(validateStudentEmail('').isValid).toBe(false);
      expect(validateStudentEmail('   ').isValid).toBe(false);
      expect(validateStudentEmail('notanemail').isValid).toBe(false);
      expect(validateStudentEmail('a@student.president.ac.id').isValid).toBe(false); // localPart < 2
    });
  });

  describe('validatePassword', () => {
    it('should accept password with at least 6 chars', () => {
      expect(validatePassword('123456').isValid).toBe(true);
      expect(validatePassword('StrongP@ssw0rd!').isValid).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('12345').isValid).toBe(false);
      expect(validatePassword('').isValid).toBe(false);
    });
  });

  describe('validateFullName', () => {
    it('should accept valid full names', () => {
      expect(validateFullName('Derrian Kalalo').isValid).toBe(true);
    });

    it('should reject empty or single-character names', () => {
      expect(validateFullName('').isValid).toBe(false);
      expect(validateFullName('D').isValid).toBe(false);
    });
  });

  describe('Security Check & Access Control', () => {
    it('should enforce student domain strictly and prevent spoofing', () => {
      const spoofAttempts = [
        'student@president.ac.id.attacker.com',
        'admin@president.ac.id',
        'evil@student.president.ac.id.phishing.net',
        'derrian@president.edu',
      ];
      spoofAttempts.forEach((email) => {
        expect(validateStudentEmail(email).isValid).toBe(false);
      });
    });

    it('should prevent password length bypass attacks', () => {
      expect(validatePassword('12345').isValid).toBe(false);
      expect(validatePassword('     ').isValid).toBe(false);
      expect(validatePassword('abc').isValid).toBe(false);
      expect(validatePassword('validpass123').isValid).toBe(true);
    });

    it('should reject empty or invalid credentials', async () => {
      const { AuthService } = require('../src/services/authService');
      const auth = AuthService.getInstance();

      await expect(auth.login('', '')).rejects.toThrow('Email dan kata sandi wajib diisi.');
      await expect(auth.login('admin@campuslife.com', '')).rejects.toThrow('Email dan kata sandi wajib diisi.');
    });

    it('should validate registration inputs and reject invalid attempts', async () => {
      const { AuthService } = require('../src/services/authService');
      const auth = AuthService.getInstance();

      // 1. Non-student email rejected
      await expect(
        auth.register('test@gmail.com', 'validpass123', 'Test User')
      ).rejects.toThrow('Pendaftaran akun mahasiswa wajib menggunakan email resmi President University');

      // 2. Short password rejected
      await expect(
        auth.register('test.user@student.president.ac.id', '123', 'Test User')
      ).rejects.toThrow('Kata sandi minimal terdiri dari 6 karakter.');

      // 3. Empty / single-character name rejected
      await expect(
        auth.register('test.user@student.president.ac.id', 'validpass123', 'T')
      ).rejects.toThrow('Nama lengkap wajib diisi minimal 2 karakter.');
    });
  });
});
