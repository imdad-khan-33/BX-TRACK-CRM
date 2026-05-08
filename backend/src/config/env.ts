import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  APP_NAME: process.env.APP_NAME || 'CRM_BACKEND',

  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
};

/**
 * Validate critical environment variables
 */
export function validateEnv(): void {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

export default env;
