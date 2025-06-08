import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
) {
  const { maxAttempts = 3, delay = 1000, backoff = true, onRetry } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const retry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      setIsRetrying(true);
      let currentAttempt = 0;

      while (currentAttempt < maxAttempts) {
        try {
          const result = await fn(...args);
          setAttempts(currentAttempt + 1);
          setIsRetrying(false);
          return result;
        } catch (error) {
          currentAttempt++;
          setAttempts(currentAttempt);
          
          if (currentAttempt >= maxAttempts) {
            setIsRetrying(false);
            throw error;
          }

          onRetry?.(currentAttempt, error as Error);

          const currentDelay = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay;
          await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
      }

      setIsRetrying(false);
      throw new Error('Max retry attempts reached');
    },
    [fn, maxAttempts, delay, backoff, onRetry]
  );

  const reset = useCallback(() => {
    setAttempts(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    isRetrying,
    attempts,
    reset,
  };
}