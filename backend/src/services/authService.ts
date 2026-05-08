import { sign } from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '../types/index';
import { userService } from './userService';
import { LoginDTO, CreateUserDTO } from '@dtos/validators';

/**
 * Auth Service - Handles authentication and JWT token generation
 */
export class AuthService {
  /**
   * Login user and return JWT token
   */
  async login(dto: LoginDTO) {
    // Get user by email (first match across all organizations)
    // In a real multi-tenant system, this could be scoped, but for now we find the user
    const user = await userService.getUserByEmailAcrossOrgs(dto.email);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await userService.verifyPassword(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Get organizationId from the user record
    const organizationId = user.organizationId;

    // Generate JWT token
    const token = this.generateToken(user.id, organizationId, user.role);

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  /**
   * Register a new user (organization + first admin)
   */
  async register(
    _organizationName: string,
    _userDto: CreateUserDTO
  ) {
    // In production, you might want to create organization separately
    // For now, we assume organization exists
    // This should be called with an organizationId context
    throw new AppError(501, 'NOT_IMPLEMENTED', 'Registration endpoint not yet implemented');
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, organizationId: string, role: string): string {
    const payload = {
      userId,
      organizationId,
      userRole: role,
    };
    return sign(
      payload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION } as any
    );
  }

  /**
   * Refresh token (generates new token)
   */
  refreshToken(userId: string, organizationId: string, role: string): string {
    return this.generateToken(userId, organizationId, role);
  }
}

export const authService = new AuthService();
