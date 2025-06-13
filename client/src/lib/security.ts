// Security utilities for input validation and sanitization

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function rateLimiter(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowKey = `${key}_${Math.floor(now / windowMs)}`;
  
  const stored = localStorage.getItem(windowKey);
  const count = stored ? parseInt(stored) : 0;
  
  if (count >= limit) {
    return false; // Rate limit exceeded
  }
  
  localStorage.setItem(windowKey, (count + 1).toString());
  
  // Clean up old entries
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (storageKey?.startsWith(key + '_')) {
      const timestamp = parseInt(storageKey.split('_')[1]);
      if (now - timestamp * windowMs > windowMs) {
        localStorage.removeItem(storageKey);
      }
    }
  }
  
  return true;
}

export const sanitizeConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'br', 'div'],
    ALLOWED_ATTR: ['href']
};

export function validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+-=[]{};':"\\|,.<>/?]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar
    );
}

export const isValidUrl = (url: string) => {
    try {
        new URL(url);
        // Basic regex to prevent obviously malicious strings.
        // This is not a substitute for proper server-side validation and sanitization.
        const harmfulChars = /['"<>\(\)]/;
        return !harmfulChars.test(url);
    } catch (_) {
        return false;
    }
};