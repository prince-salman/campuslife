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
});
