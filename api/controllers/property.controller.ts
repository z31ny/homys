import { Request, Response, NextFunction } from 'express';
import { eq, and, gte, lte, like, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { properties, propertyImages, propertyFeatures, bookings } from '../db/schema';
import { AppError } from '../middleware/errorHandler';
import type { CreatePropertyInput, UpdatePropertyInput } from '../validators/property';

/**
 * POST /api/properties
 * Authenticated owner creates a new property listing.
 */
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const {
      features: featuresList,
      imageUrls,
      heroImageIndex,
      ...propertyData
    } = req.body as CreatePropertyInput;

    // Generate a display ID like HOM-XXXX
    const displayId = `HOM-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert the property
    const [newProperty] = await db
      .insert(properties)
      .values({
        ...propertyData,
        ownerId: req.user.userId,
        status: 'pending_review',
        propertyIdDisplay: displayId,
      })
      .returning();

    // Insert images if provided
    if (imageUrls && imageUrls.length > 0) {
      await db.insert(propertyImages).values(
        imageUrls.map((url: string, index: number) => ({
          propertyId: newProperty.id,
          imageUrl: url,
          isHero: index === (heroImageIndex || 0),
          displayOrder: index,
        }))
      );
    }

    // Insert features/amenities if provided
    if (featuresList && featuresList.length > 0) {
      await db.insert(propertyFeatures).values(
        featuresList.map((name: string) => ({
          propertyId: newProperty.id,
          featureName: name,
        }))
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'Property submitted for review.',
      data: { property: newProperty },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties
 * Public — list approved properties with optional filters and pagination.
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 12,
      propertyType,
      viewType,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      maxGuests,
    } = req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || '12', 10)));
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [eq(properties.status, 'approved')];

    if (propertyType) {
      conditions.push(eq(properties.propertyType, propertyType as any));
    }
    if (viewType) {
      conditions.push(eq(properties.viewType, viewType as any));
    }
    if (location) {
      conditions.push(like(properties.locationName, `%${location}%`));
    }
    // Swap minPrice/maxPrice if inverted (edge case 2.11)
    let effectiveMinPrice = minPrice;
    let effectiveMaxPrice = maxPrice;
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      effectiveMinPrice = maxPrice;
      effectiveMaxPrice = minPrice;
    }
    if (effectiveMinPrice) {
      conditions.push(gte(properties.pricePerNight, effectiveMinPrice));
    }
    if (effectiveMaxPrice) {
      conditions.push(lte(properties.pricePerNight, effectiveMaxPrice));
    }
    if (bedrooms) {
      conditions.push(gte(properties.bedrooms, parseInt(bedrooms, 10)));
    }
    if (maxGuests) {
      conditions.push(gte(properties.maxGuests, parseInt(maxGuests, 10)));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(and(...conditions));

    // Get properties
    const items = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Fetch hero images for each property
    const propertyIds = items.map((p) => p.id);
    let images: any[] = [];
    if (propertyIds.length > 0) {
      images = await db
        .select()
        .from(propertyImages)
        .where(
          sql`${propertyImages.propertyId} IN ${propertyIds}`
        );
    }

    // Attach hero image to each property
    const propertiesWithImages = items.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id);
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];
      return {
        ...prop,
        heroImageUrl: heroImage?.imageUrl || null,
        imageCount: propImages.length,
      };
    });

    res.json({
      status: 'success',
      data: {
        properties: propertiesWithImages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/mine
 * Authenticated — list current user's properties (all statuses).
 */
export const getMyProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const items = await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, req.user.userId))
      .orderBy(desc(properties.createdAt));

    res.json({
      status: 'success',
      data: { properties: items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/:id
 * Public — single property with images and features.
 */
export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    // Only show non-approved properties to their owner
    if (property.status !== 'approved') {
      if (!req.user || req.user.userId !== property.ownerId) {
        throw new AppError('Property not found.', 404);
      }
    }

    // Fetch images
    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .orderBy(propertyImages.displayOrder);

    // Fetch features
    const features = await db
      .select()
      .from(propertyFeatures)
      .where(eq(propertyFeatures.propertyId, id));

    res.json({
      status: 'success',
      data: {
        property: {
          ...property,
          images,
          features: features.map((f) => f.featureName),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/properties/:id
 * Authenticated — owner updates their property.
 */
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const { id } = req.params;
    const { features: featuresList, ...updates } = req.body as UpdatePropertyInput & { features?: string[] };

    // Verify ownership
    const [existing] = await db
      .select({ ownerId: properties.ownerId })
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      throw new AppError('Property not found.', 404);
    }

    if (existing.ownerId !== req.user.userId) {
      throw new AppError('You can only edit your own properties.', 403);
    }

    // Update property fields
    const [updated] = await db
      .update(properties)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    // If features provided, replace them
    if (featuresList) {
      await db.delete(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
      if (featuresList.length > 0) {
        await db.insert(propertyFeatures).values(
          featuresList.map((name: string) => ({
            propertyId: id,
            featureName: name,
          }))
        );
      }
    }

    res.json({
      status: 'success',
      message: 'Property updated successfully.',
      data: { property: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/properties/:id
 * Authenticated — owner archives (soft-deletes) their property.
 */
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select({ ownerId: properties.ownerId })
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      throw new AppError('Property not found.', 404);
    }

    if (existing.ownerId !== req.user.userId) {
      throw new AppError('You can only delete your own properties.', 403);
    }

    // Soft-delete: check for future non-cancelled bookings first (edge case 2.9)
    const today = new Date().toISOString().split('T')[0];
    const futureBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, id),
          sql`${bookings.status} NOT IN ('cancelled')`,
          sql`${bookings.checkOut} > ${today}::date`
        )
      )
      .limit(1);

    if (futureBookings.length > 0) {
      throw new AppError('Cannot archive this property — it has upcoming bookings. Cancel or complete them first.', 400);
    }

    // Soft-delete: set status to archived
    await db
      .update(properties)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(properties.id, id));

    res.json({
      status: 'success',
      message: 'Property archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};
