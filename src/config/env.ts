import { z } from 'zod';

/**
 * Browser-safe public environment schema.
 * Only NEXT_PUBLIC_* variables are included here so no server secrets can leak to client bundles.
 */
const publicEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:5000/api/v1'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default('http://localhost:5000'),
});

/**
 * Server-only environment schema.
 * BACKEND_API_URL is strictly restricted to Server Components and Next.js Route Handlers.
 */
const serverEnvSchema = publicEnvSchema.extend({
  BACKEND_API_URL: z.string().url().default('http://localhost:5000'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validatePublicEnv(rawEnv: Record<string, string | undefined> = process.env): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NODE_ENV: rawEnv.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_BASE_URL: rawEnv.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_SOCKET_URL: rawEnv.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`[Public Env Validation Error] ${issues}`);
  }

  return parsed.data;
}

export function validateServerEnv(rawEnv: Record<string, string | undefined> = process.env): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('Security violation: validateServerEnv() must not be called in browser code.');
  }

  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: rawEnv.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_BASE_URL: rawEnv.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_SOCKET_URL: rawEnv.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    BACKEND_API_URL: rawEnv.BACKEND_API_URL || 'http://localhost:5000',
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`[Server Env Validation Error] ${issues}`);
  }

  return parsed.data;
}

export const publicEnv: PublicEnv = validatePublicEnv({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
});

export function getServerEnv(): ServerEnv {
  return validateServerEnv(process.env);
}

