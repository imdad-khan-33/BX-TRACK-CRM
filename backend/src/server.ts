import app from './app';
import { env } from '@config/env';
import { validateEnv } from '@config/env';
import { getPrismaClient } from '@config/database';

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();

    // Initialize Prisma
    const prisma = getPrismaClient();
    await prisma.$connect();
    console.log('[DB] Connected to database');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`[${env.APP_NAME}] Server running on http://localhost:${env.PORT}`);
      console.log(`[${env.APP_NAME}] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('[FATAL]', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  process.exit(1);
});

startServer();
