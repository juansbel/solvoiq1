import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateFormData } from '@/lib/validation';
import { sanitizeInput } from '@/lib/security';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  sanitize?: boolean;
  onSubmit?: (data: T) => void | Promise<void>;
  onError?: (errors: z.ZodError) => void;
}

export function useFormValidation<T>({
  schema,
  sanitize = true,
  onSubmit,
  onError
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sanitizeData = useCallback((data: any): any => {
    if (!sanitize) return data;
    
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizeInput(sanitized[key]);
      }
    }
    return sanitized;
  }, [sanitize]);

  const validate = useCallback((data: unknown) => {
    const sanitizedData = sanitizeData(data);
    const result = validateFormData(schema, sanitizedData);
    
    if (result.success) {
      setErrors({});
      return { success: true, data: result.data };
    }
    
    const fieldErrors: Record<string, string> = {};
    result.errors.errors.forEach(error => {
      const field = error.path.join('.');
      fieldErrors[field] = error.message;
    });
    
    setErrors(fieldErrors);
    onError?.(result.errors);
    return { success: false, errors: fieldErrors };
  }, [schema, sanitizeData, onError]);

  const handleSubmit = useCallback(async (data: unknown) => {
    setIsSubmitting(true);
    
    try {
      const validation = validate(data);
      if (validation.success && onSubmit) {
        await onSubmit(validation.data as T);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((field: string) => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    isSubmitting,
    validate,
    handleSubmit,
    clearErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
}