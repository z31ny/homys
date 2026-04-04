import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import type { RegisterInput, LoginInput } from '../validators/auth';
import type { JwtPayload } from '../middleware/auth';

const SALT_ROUNDS = 12;

/**
 * Generate a JWT for a user.
 */
function generateToken(userId: string, email: string): string {
  const payload: JwtPayload = { userId, email };
  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
}

/**
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password, gender, ageRange } = req.body as RegisterInput;

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError('An account with this email already exists.', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        gender: gender || null,
        ageRange: ageRange || null,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        gender: users.gender,
        ageRange: users.ageRange,
        createdAt: users.createdAt,
      });

    // Generate token
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          ageRange: user.ageRange,
          country: user.country,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * For MVP: just acknowledges the request.
 * Phase 3 will add Resend email integration.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Check if user exists (don't reveal whether email exists for security)
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success (prevents email enumeration)
    res.json({
      status: 'success',
      message: 'If an account with that email exists, a reset link has been sent.',
    });

    // TODO (Phase 3): If user exists, generate reset token and send via Resend
    if (user) {
      console.log(`[TODO] Send password reset email to ${email}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        gender: users.gender,
        ageRange: users.ageRange,
        country: users.country,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 * Update the authenticated user's profile.
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const updates = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        gender: users.gender,
        ageRange: users.ageRange,
        country: users.country,
        profileImageUrl: users.profileImageUrl,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      throw new AppError('User not found.', 404);
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
