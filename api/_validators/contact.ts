import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(30).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
