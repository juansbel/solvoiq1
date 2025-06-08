import { z } from 'zod';

// Enhanced validation schemas with security considerations
export const secureStringSchema = z.string()
  .min(1, "Field is required")
  .max(1000, "Input too long")
  .refine(val => !val.includes('<script'), "Invalid characters detected")
  .refine(val => !val.includes('javascript:'), "Invalid protocol detected");

export const emailSchema = z.string()
  .email("Invalid email format")
  .max(320, "Email too long")
  .refine(email => {
    const parts = email.split('@');
    return parts[0].length <= 64 && parts[1].length <= 253;
  }, "Email format invalid");

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d\s\-\(\)]{0,20}$/, "Invalid phone number format")
  .optional();

export const urlSchema = z.string()
  .url("Invalid URL format")
  .refine(url => {
    const allowedProtocols = ['http:', 'https:'];
    try {
      return allowedProtocols.includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }, "Only HTTP/HTTPS URLs allowed")
  .optional();

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[^A-Za-z0-9]/, "Password must contain special character");

export const searchQuerySchema = z.string()
  .max(200, "Search query too long")
  .refine(query => {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
    return !dangerousPatterns.some(pattern => pattern.test(query));
  }, "Invalid search query");

export const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB limit
  type: z.string().refine(type => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(type);
  }, "File type not allowed")
});

export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export const validateEmail = (email: string): string | null => {
  if (!z.string().email().safeParse(email).success) {
    return "Invalid email address.";
  }
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return "Invalid phone number format.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
};