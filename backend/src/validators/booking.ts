import { z } from 'zod';

export const createBookingSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  numGuests: z.number().int().min(1).default(1),
  numRooms: z.number().int().min(1).default(1),
  specialRequests: z.string().max(2000).optional(),
  guestFirstName: z.string().min(1).max(100),
  guestLastName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().max(30).optional(),
  addons: z.array(z.object({
    serviceName: z.string().min(1).max(255),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal'),
  })).default([]),
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  { message: 'Check-out date must be after check-in date', path: ['checkOut'] }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
