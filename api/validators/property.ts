import { z } from 'zod';

export const createPropertySchema = z.object({
  projectName: z.string().max(255).optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio']),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  sqft: z.number().int().positive().optional(),
  pricePerNight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than zero'),
  isFurnished: z.boolean().default(false),
  description: z.string().max(5000).optional(),
  locationName: z.string().max(255).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  nearbyEssentials: z.array(z.string()).default([]),
  maxGuests: z.number().int().min(1).default(2),
  viewType: z.enum(['sea', 'pool', 'garden', 'city']).optional(),
  features: z.array(z.string().max(100)).default([]),
  imageUrls: z.array(z.string().url()).default([]),
  heroImageIndex: z.number().int().min(0).default(0),
});

export const updatePropertySchema = z.object({
  projectName: z.string().max(255).optional(),
  title: z.string().min(2).max(255).optional(),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  sqft: z.number().int().positive().optional(),
  pricePerNight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isFurnished: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  locationName: z.string().max(255).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  nearbyEssentials: z.array(z.string()).optional(),
  maxGuests: z.number().int().min(1).optional(),
  viewType: z.enum(['sea', 'pool', 'garden', 'city']).optional(),
  features: z.array(z.string().max(100)).optional(),
});

export const queryPropertiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  propertyType: z.enum(['apartment', 'villa', 'chalet', 'studio']).optional(),
  viewType: z.enum(['sea', 'pool', 'garden', 'city']).optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  maxGuests: z.coerce.number().int().min(1).optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type QueryPropertiesInput = z.infer<typeof queryPropertiesSchema>;
