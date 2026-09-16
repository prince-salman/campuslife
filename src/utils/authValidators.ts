/**
 * Authentication and email validation utilities for CampusLife.
 * Enforces President University student email domain requirement.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const STUDENT_EMAIL_DOMAIN = '@student.president.ac.id';

/**
 * Validates whether an email belongs to the official President University student domain.
 * Example: 'derrian.kalalo@student.president.ac.id' -> valid
 * Example: 'user@gmail.com' -> invalid
 */
export function validateStudentEmail(email: string): ValidationResult {
  const trimmed = (email || '').trim().toLowerCase();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email mahasiswa wajib diisi.',
    };
  }

  // Basic email structure check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Format email tidak valid.',
    };
  }

  if (!trimmed.endsWith(STUDENT_EMAIL_DOMAIN)) {
    return {
      isValid: false,
      error: `Pendaftaran akun mahasiswa wajib menggunakan email resmi President University (${STUDENT_EMAIL_DOMAIN}).`,
    };
  }

  const localPart = trimmed.slice(0, trimmed.length - STUDENT_EMAIL_DOMAIN.length);
  if (!localPart || localPart.length < 2) {
    return {
      isValid: false,
      error: 'Bagian nama email sebelum domain terlalu pendek.',
    };
  }

  return { isValid: true };
}

/**
 * Validates password strength (minimum 6 characters).
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'Kata sandi minimal terdiri dari 6 karakter.',
    };
  }
  return { isValid: true };
}

/**
 * Validates full name.
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = (name || '').trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Nama lengkap wajib diisi minimal 2 karakter.',
    };
  }
  return { isValid: true };
}
