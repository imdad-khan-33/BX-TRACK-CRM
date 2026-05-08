import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from '@config/env';
import { errorHandler } from '@middleware/errorHandler';
import { rateLimiterMiddleware } from '@middleware/rateLimiter';

const app = express();

/**
 * Middleware
 */
const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

/**
 * Rate limiting (global)
 */
app.use(rateLimiterMiddleware(env.RATE_LIMIT_MAX_REQUESTS, env.RATE_LIMIT_WINDOW_MS));

/**
 * Health check endpoint (no auth required)
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * API v1 routes
 */
import apiRoutes from '@routes/index';

app.use('/api/v1', apiRoutes);

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Error handler (must be last)
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
