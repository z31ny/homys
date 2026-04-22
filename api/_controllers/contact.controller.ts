import { Request, Response, NextFunction } from 'express';
import { db } from '../_db';
import { contactSubmissions } from '../_db/schema';
import type { ContactInput } from '../_validators/contact';

/**
 * POST /api/contact
 * Public — submit a contact form message.
 */
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, message } = req.body as ContactInput;

    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        message,
      })
      .returning({
        id: contactSubmissions.id,
        createdAt: contactSubmissions.createdAt,
      });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been received. We\'ll get back to you shortly.',
      data: { submissionId: submission.id },
    });
  } catch (error) {
    next(error);
  }
};
