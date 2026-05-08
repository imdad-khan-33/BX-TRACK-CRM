import { Response, NextFunction } from 'express';
import { TenantRequest, AppError } from '../types/index';

// In-memory rate limiter (for development)
// In production, use Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimiterMiddleware(
  maxRequests: number = 1000,
  windowMs: number = 60000
) {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    const userId = req.tenant?.userId || req.ip || 'unknown';
    const now = Date.now();

    let userLimit = requestCounts.get(userId);

    // Initialize or reset if window expired
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + windowMs };
      requestCounts.set(userId, userLimit);
    }

    userLimit.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - userLimit.count));
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(userLimit.resetTime / 1000)
    );

    if (userLimit.count > maxRequests) {
      throw new AppError(
        429,
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later'
      );
    }

    next();
  };
}

/**
 * Stricter rate limiting for auth endpoints
 */
export function authRateLimiterMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void {
  return rateLimiterMiddleware(50, 60000)(req, res, next);
}
