import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_GEMINI_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  AI_API_KEY: z.string().min(1),
  AI_API_URL: z.string().url(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${key} is not set`);
};

// Configuration object
export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: getEnv('NETLIFY_DATABASE_URL', env.DATABASE_URL),
    ssl: {
      rejectUnauthorized: false
    }
  },
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY
  },
  gemini: {
    apiKey: env.VITE_GEMINI_API_KEY
  },
  cors: {
    origin: env.CORS_ORIGIN
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX, 10)
  },
  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
  },
  ai: {
    apiKey: getEnv('GEMINI_API_KEY', ''),
    apiUrl: getEnv('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'),
  }
} as const;

// Type for the config object
export type Config = typeof config; 