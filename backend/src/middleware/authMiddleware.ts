import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { TenantRequest, JWTPayload, AppError } from '../types/index';

/**
 * Verify JWT token and extract tenant context
 */
export function authMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError(401, 'NO_TOKEN', 'No authentication token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Attach tenant context to request
    req.tenant = {
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      userRole: decoded.userRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return void res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (error instanceof AppError) {
      return void res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Extract JWT token from Authorization header or cookies
 */
function extractToken(req: TenantRequest): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback to cookie
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Verify user is admin
 */
export function adminOnlyMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.tenant?.userRole !== 'admin') {
    return void res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
      timestamp: new Date().toISOString(),
    });
  }

  next();
}
