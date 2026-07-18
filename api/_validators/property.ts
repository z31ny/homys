import { z } from 'zod';

// A per-property extra fee (HK, cleaning, beach access, …).
export const feeSchema = z.object({
  name: z.string().min(1, 'Fee name is required').max(120),
  amount: z.coerce.number({ invalid_type_error: 'Fee amount must be a number' }).min(0, 'Fee amount cannot be negative'),
  feeType: z.enum(['per_stay', 'per_night']).default('per_stay'),
});

export const createPropertySchema = z.object({
  projectName: z.string().max(255).optional(),
  title: z.string().min(2, 'Property title must be at least 2 characters').max(255, 'Property title is too long'),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio', 'other'], {
    errorMap: () => ({ message: 'Please select a valid property type' }),
  }),
  propertyTypeOther: z.string().max(100).optional(),
  bedrooms: z.coerce.number({ invalid_type_error: 'Bedrooms must be a number' }).int().min(0).default(1),
  bathrooms: z.coerce.number({ invalid_type_error: 'Bathrooms must be a number' }).int().min(0).default(1),
  sqft: z.coerce.number({ invalid_type_error: 'Square footage must be a number' }).int().positive('Square footage must be greater than zero').optional(),
  pricePerNight: z
    .string({ required_error: 'Price per night is required' })
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number (e.g. 2500 or 250.00)')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than zero'),
  isFurnished: z.boolean().default(false),
  description: z.string().max(5000, 'Description is too long').optional(),
  houseRules: z.array(z.string().max(200)).default([]),
  locationName: z.string().max(255).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  nearbyEssentials: z.array(z.string()).default([]),
  maxGuests: z.coerce.number({ invalid_type_error: 'Max guests must be a number' }).int().min(1, 'Must allow at least 1 guest').default(2),
  offersHousekeeping: z.coerce.boolean().optional(),
  offersBeachAccess: z.coerce.boolean().optional(),
  serviceFeePercent: z.coerce.number({ invalid_type_error: 'Service fee must be a number' }).min(0).max(100).optional(),
  viewType: z.enum(['sea', 'pool', 'garden', 'city', 'lagoon', 'other']).optional(),
  viewTypeOther: z.string().max(100).optional(),
  features: z.array(z.string().max(100)).default([]),
  imageUrls: z.array(z.string().url('Each image must be a valid URL')).default([]),
  heroImageIndex: z.coerce.number().int().min(0).default(0),
  fees: z.array(feeSchema).default([]),
});

export const updatePropertySchema = z.object({
  projectName: z.string().max(255).optional(),
  title: z.string().min(2, 'Property title must be at least 2 characters').max(255).optional(),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio', 'other']).optional(),
  propertyTypeOther: z.string().max(100).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  sqft: z.coerce.number({ invalid_type_error: 'Square footage must be a number' }).int().positive().optional(),
  pricePerNight: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number').optional(),
  isFurnished: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  houseRules: z.array(z.string().max(200)).optional(),
  locationName: z.string().max(255).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  nearbyEssentials: z.array(z.string()).optional(),
  maxGuests: z.coerce.number().int().min(1).optional(),
  offersHousekeeping: z.coerce.boolean().optional(),
  offersBeachAccess: z.coerce.boolean().optional(),
  serviceFeePercent: z.coerce.number().min(0).max(100).optional(),
  viewType: z.enum(['sea', 'pool', 'garden', 'city', 'lagoon', 'other']).optional(),
  viewTypeOther: z.string().max(100).optional(),
  features: z.array(z.string().max(100)).optional(),
  fees: z.array(feeSchema).optional(),
});

export const queryPropertiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio', 'other']).optional(),
  viewType: z.enum(['sea', 'pool', 'garden', 'city', 'lagoon', 'other']).optional(),
  location: z.string().optional(),
  project: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  maxGuests: z.coerce.number().int().min(1).optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type QueryPropertiesInput = z.infer<typeof queryPropertiesSchema>;
