export function sanitizeExternalUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const dangerousSchemes = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'blob:',
    'about:',
  ];

  for (const scheme of dangerousSchemes) {
    if (lower.startsWith(scheme)) {
      return null;
    }
  }

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function isSafeUrl(url: string | undefined | null): boolean {
  return sanitizeExternalUrl(url) !== null;
}

export function sanitizeWhatsAppPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    return '62' + clean.slice(1);
  }
  return clean;
}

export function sanitizeInput(text: string | undefined | null, maxLength: number = 500): string {
  if (!text) return '';
  const noControlChars = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return noControlChars.slice(0, maxLength);
}

interface AttemptRecord {
  count: number;
  lockedUntil?: number;
}

class LoginRateLimiter {
  private attempts = new Map<string, AttemptRecord>();
  private maxAttempts = 5;
  private lockDurationMs = 5 * 60 * 1000;

  public checkLimit(key: string): { isLocked: boolean; remainingSeconds: number } {
    const now = Date.now();
    const record = this.attempts.get(key.toLowerCase());
    if (!record) return { isLocked: false, remainingSeconds: 0 };

    if (record.lockedUntil && record.lockedUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      };
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  public recordFailure(key: string): { isLocked: boolean; remainingSeconds: number } {
    const now = Date.now();
    const normKey = key.toLowerCase();
    const record = this.attempts.get(normKey) || { count: 0 };

    if (record.lockedUntil && record.lockedUntil <= now) {
      record.count = 0;
      record.lockedUntil = undefined;
    }

    record.count += 1;
    if (record.count >= this.maxAttempts) {
      record.lockedUntil = now + this.lockDurationMs;
      this.attempts.set(normKey, record);
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(this.lockDurationMs / 1000),
      };
    }

    this.attempts.set(normKey, record);
    return { isLocked: false, remainingSeconds: 0 };
  }

  public recordSuccess(key: string): void {
    this.attempts.delete(key.toLowerCase());
  }
}

export const loginRateLimiter = new LoginRateLimiter();
