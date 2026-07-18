import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/** Human-friendly labels for common field names */
const FIELD_LABELS: Record<string, string> = {
  title: 'Property Title',
  propertyType: 'Property Type',
  propertyTypeOther: 'Property Type (Other)',
  viewType: 'View Type',
  viewTypeOther: 'View Type (Other)',
  sqft: 'Square Footage',
  pricePerNight: 'Price per Night',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  maxGuests: 'Max Guests',
  isFurnished: 'Furnished',
  description: 'Description',
  houseRules: 'House Rules',
  amenities: 'Amenities',
  locationName: 'Location',
  latitude: 'Latitude',
  longitude: 'Longitude',
  nearbyEssentials: 'Nearby Essentials',
  imageUrls: 'Images',
  heroImageIndex: 'Cover Image',
  fullName: 'Full Name',
  email: 'Email Address',
  password: 'Password',
  phone: 'Phone Number',
  country: 'Country',
  minimumStay: 'Minimum Stay',
  checkIn: 'Check-in Date',
  checkOut: 'Check-out Date',
  numGuests: 'Number of Guests',
};

/**
 * Validates request body against a Zod schema.
 * Returns 400 with detailed, user-friendly validation errors if invalid.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues ?? [];
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: issues.map((issue) => {
            const rawField = issue.path.map(String).join('.');
            const label = FIELD_LABELS[rawField] || rawField.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
            return {
              field: rawField,
              label,
              message: issue.message,
            };
          }),
        });
      }
      next(error);
    }
  };
};
