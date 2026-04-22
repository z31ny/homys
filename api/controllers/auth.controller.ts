import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db';
import { users, passwordResetTokens } from '../db/schema';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import type { RegisterInput, LoginInput, ResetPasswordInput } from '../validators/auth';
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
          isAdmin: user.isAdmin,
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
 * Checks if email exists, generates a reset token, and sends an email via Resend.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Don't reveal whether email exists — return generic success
      return res.json({
        status: 'success',
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any previous reset tokens for this user (edge case 9.4)
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false)
        )
      );

    // Store the hashed token in the database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: tokenHash,
      expiresAt,
    });

    // Build the reset link
    const frontendUrl = config.frontendUrl || 'https://homys-eta.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email via Resend
    let emailSent = false;
    let emailError = '';

    if (config.resend.apiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.resend.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: config.resend.fromEmail,
            to: [user.email],
            subject: 'Reset Your Homys Password',
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #112a3d; font-size: 28px; margin-bottom: 20px;">Password Reset</h1>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  You requested a password reset for your Homys account. Click the button below to set a new password.
                  This link will expire in <strong>1 hour</strong>.
                </p>
                <a href="${resetLink}" style="display: inline-block; background-color: #112a3d; color: #f6f3eb; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                  Reset Password
                </a>
                <p style="color: #999; font-size: 13px; margin-top: 30px; line-height: 1.6;">
                  If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #bbb; font-size: 12px;">© Homys — Your Sanctuary Awaits</p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
        } else {
          const errBody = await emailResponse.text();
          console.error('[Resend] Failed to send email:', errBody);
          emailError = errBody;
        }
      } catch (err: any) {
        console.error('[Resend] Email sending error:', err);
        emailError = err.message || 'Unknown email error';
      }
    } else {
      emailError = 'RESEND_API_KEY not configured';
      console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);
    }

    // Always return success to prevent email enumeration
    // Debug info removed for production security (edge case 10)
    if (!emailSent && emailError) {
      console.error('[ForgotPassword] Email not sent:', emailError);
    }

    res.json({
      status: 'success',
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Validates the token and sets a new password.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body as ResetPasswordInput;

    // Hash the incoming token to match what's stored
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid, unused, non-expired token
    const [resetRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetRecord) {
      throw new AppError('Invalid or expired reset token. Please request a new password reset.', 400);
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user's password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetRecord.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetRecord.id));

    res.json({
      status: 'success',
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
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
        isAdmin: users.isAdmin,
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

    const rawUpdates = req.body;

    // Strip fields that must not be user-editable (edge case 1.17)
    const { isAdmin, passwordHash, id, email, createdAt, ...safeUpdates } = rawUpdates;

    // If email change is attempted via a non-stripped path, check uniqueness (edge case 1.15)
    if (rawUpdates.email && rawUpdates.email !== req.user.email) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, rawUpdates.email.toLowerCase()))
        .limit(1);
      if (existing) {
        throw new AppError('An account with this email already exists.', 409);
      }
      // If email is allowed in updateProfileSchema, add it safely
      (safeUpdates as any).email = rawUpdates.email.toLowerCase();
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...safeUpdates,
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
