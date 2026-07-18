import { Request, Response, NextFunction } from 'express';
import { eq, and, gte, lte, ilike, sql, desc } from 'drizzle-orm';
import { db } from '../_db';
import {
  properties,
  propertyImages,
  propertyFeatures,
  propertyFees,
  bookings,
  locationDiscounts,
} from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';
import { cancelStalePendingBookings } from './booking.controller';
import type { CreatePropertyInput, UpdatePropertyInput } from '../_validators/property';

/** Apply any active discount whose keyword matches the location string. */
function applyDiscount(pricePerNight: string, locationName: string | null, discounts: any[]): {
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number | null;
  discountLabel: string | null;
} {
  const original = parseFloat(pricePerNight || '0');
  if (!locationName || !discounts.length) {
    return { originalPrice: original, discountedPrice: original, discountPercent: null, discountLabel: null };
  }

  const now = new Date();
  const match = discounts.find((d) => {
    if (!d.isActive) return false;
    if (d.startsAt && new Date(d.startsAt) > now) return false;
    if (d.endsAt && new Date(d.endsAt) < now) return false;
    return locationName.toLowerCase().includes(d.locationKeyword.toLowerCase());
  });

  if (!match) {
    return { originalPrice: original, discountedPrice: original, discountPercent: null, discountLabel: null };
  }

  const pct = parseFloat(match.discountPercent);
  const discounted = Math.round(original * (1 - pct / 100) * 100) / 100;
  return {
    originalPrice: original,
    discountedPrice: discounted,
    discountPercent: pct,
    discountLabel: match.label || null,
  };
}

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);

    const { features: featuresList, imageUrls, heroImageIndex, fees, serviceFeePercent, ...propertyData } = req.body as CreatePropertyInput;
    const displayId = `HOM-${Math.floor(1000 + Math.random() * 9000)}`;

    const [newProperty] = await db
      .insert(properties)
      .values({
        ...propertyData,
        ...(serviceFeePercent != null ? { serviceFeePercent: String(serviceFeePercent) } : {}),
        ownerId: req.user.userId, status: 'pending_review', propertyIdDisplay: displayId,
      })
      .returning();

    if (fees?.length > 0) {
      await db.insert(propertyFees).values(
        fees.map((f) => ({ propertyId: newProperty.id, name: f.name, amount: String(f.amount), feeType: f.feeType }))
      );
    }

    if (imageUrls?.length > 0) {
      await db.insert(propertyImages).values(
        imageUrls.map((url: string, index: number) => ({
          propertyId: newProperty.id,
          imageUrl: url,
          isHero: index === (heroImageIndex || 0),
          displayOrder: index,
        }))
      );
    }

    if (featuresList?.length > 0) {
      await db.insert(propertyFeatures).values(
        featuresList.map((name: string) => ({ propertyId: newProperty.id, featureName: name }))
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

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, propertyType, viewType, location, project, minPrice, maxPrice, bedrooms, maxGuests } =
      req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || '12', 10)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(properties.status, 'approved')];
    if (propertyType) conditions.push(eq(properties.propertyType, propertyType as any));
    if (viewType) conditions.push(eq(properties.viewType, viewType as any));
    if (location) conditions.push(ilike(properties.locationName, `%${location}%`));
    if (project) conditions.push(ilike(properties.projectName, `%${project}%`));

    let effectiveMinPrice = minPrice;
    let effectiveMaxPrice = maxPrice;
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      effectiveMinPrice = maxPrice;
      effectiveMaxPrice = minPrice;
    }
    if (effectiveMinPrice) conditions.push(gte(properties.pricePerNight, effectiveMinPrice));
    if (effectiveMaxPrice) conditions.push(lte(properties.pricePerNight, effectiveMaxPrice));
    if (bedrooms) conditions.push(gte(properties.bedrooms, parseInt(bedrooms, 10)));
    if (maxGuests) conditions.push(gte(properties.maxGuests, parseInt(maxGuests, 10)));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(and(...conditions));

    const items = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt))
      .limit(limitNum)
      .offset(offset);

    const propertyIds = items.map((p) => p.id);
    let images: any[] = [];
    if (propertyIds.length > 0) {
      images = await db.select().from(propertyImages).where(sql`${propertyImages.propertyId} IN ${propertyIds}`);
    }

    // Fetch all currently-active discounts once and apply in memory
    const now = new Date();
    const activeDiscounts = await db
      .select()
      .from(locationDiscounts)
      .where(eq(locationDiscounts.isActive, true));

    const propertiesWithImages = items.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id);
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];

      // Location discount takes priority; fall back to property-level discount set by admin
      const locDiscount = applyDiscount(prop.pricePerNight, prop.locationName, activeDiscounts);
      let finalDiscountPct: number | null = locDiscount.discountPercent;
      let finalDiscountLabel: string | null = locDiscount.discountLabel;
      let finalOriginal: number | null = locDiscount.discountPercent ? locDiscount.originalPrice : null;
      let finalPrice: string = locDiscount.discountedPrice.toFixed(2);

      if (!finalDiscountPct && prop.discountPercent && parseFloat(prop.discountPercent) > 0) {
        const pct = parseFloat(prop.discountPercent);
        const base = parseFloat(prop.pricePerNight || '0');
        finalDiscountPct = pct;
        finalDiscountLabel = prop.discountLabel || null;
        finalOriginal = base;
        finalPrice = (base * (1 - pct / 100)).toFixed(2);
      }

      return {
        ...prop,
        heroImageUrl: heroImage?.imageUrl || null,
        imageCount: propImages.length,
        images: propImages
          .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((img: any) => img.imageUrl),
        originalPricePerNight: finalOriginal,
        pricePerNight: finalPrice,
        discountPercent: finalDiscountPct,
        discountLabel: finalDiscountLabel,
      };
    });

    res.json({
      status: 'success',
      data: {
        properties: propertiesWithImages,
        pagination: { page: pageNum, limit: limitNum, total: Number(count), totalPages: Math.ceil(Number(count) / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/properties/featured — returns up to 6 admin-featured approved properties */
export const getFeaturedProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select()
      .from(properties)
      .where(and(eq(properties.status, 'approved'), eq(properties.isFeatured, true)))
      .orderBy(desc(properties.createdAt))
      .limit(6);

    const propertyIds = items.map((p) => p.id);
    let images: any[] = [];
    if (propertyIds.length > 0) {
      images = await db.select().from(propertyImages).where(sql`${propertyImages.propertyId} IN ${propertyIds}`);
    }

    const activeDiscounts = await db.select().from(locationDiscounts).where(eq(locationDiscounts.isActive, true));

    const result = items.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id);
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];
      const locDiscount = applyDiscount(prop.pricePerNight, prop.locationName, activeDiscounts);
      let finalPrice: string = locDiscount.discountedPrice.toFixed(2);
      let finalDiscountPct: number | null = locDiscount.discountPercent;
      let finalOriginal: number | null = locDiscount.discountPercent ? locDiscount.originalPrice : null;

      if (!finalDiscountPct && prop.discountPercent && parseFloat(prop.discountPercent) > 0) {
        const pct = parseFloat(prop.discountPercent);
        const base = parseFloat(prop.pricePerNight || '0');
        finalDiscountPct = pct;
        finalOriginal = base;
        finalPrice = (base * (1 - pct / 100)).toFixed(2);
      }

      return {
        ...prop,
        heroImageUrl: heroImage?.imageUrl || null,
        images: propImages
          .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((img: any) => img.imageUrl),
        pricePerNight: finalPrice,
        discountPercent: finalDiscountPct,
        originalPricePerNight: finalOriginal,
      };
    });

    res.json({ status: 'success', data: { properties: result } });
  } catch (error) {
    next(error);
  }
};

export const getMyProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const items = await db.select().from(properties).where(eq(properties.ownerId, req.user.userId)).orderBy(desc(properties.createdAt));
    res.json({ status: 'success', data: { properties: items } });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const [property] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);

    if (!property) throw new AppError('Property not found.', 404);
    if (property.status !== 'approved') {
      if (!req.user || req.user.userId !== property.ownerId) throw new AppError('Property not found.', 404);
    }

    const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id)).orderBy(propertyImages.displayOrder);
    const features = await db.select().from(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
    const fees = await db.select().from(propertyFees).where(eq(propertyFees.propertyId, id));

    // Apply active discounts to single property view too
    const activeDiscounts = await db.select().from(locationDiscounts).where(eq(locationDiscounts.isActive, true));
    const locDiscount = applyDiscount(property.pricePerNight, property.locationName, activeDiscounts);

    // Location discount takes priority; fall back to property-level discount set by admin
    let finalDiscountPct: number | null = locDiscount.discountPercent;
    let finalDiscountLabel: string | null = locDiscount.discountLabel;
    let finalOriginal: number | null = locDiscount.discountPercent ? locDiscount.originalPrice : null;
    let finalPrice: string = locDiscount.discountedPrice.toFixed(2);

    if (!finalDiscountPct && property.discountPercent && parseFloat(property.discountPercent) > 0) {
      const pct = parseFloat(property.discountPercent);
      const base = parseFloat(property.pricePerNight || '0');
      finalDiscountPct = pct;
      finalDiscountLabel = property.discountLabel || null;
      finalOriginal = base;
      finalPrice = (base * (1 - pct / 100)).toFixed(2);
    }

    res.json({
      status: 'success',
      data: {
        property: {
          ...property,
          images,
          features: features.map((f) => f.featureName),
          fees: fees.map((f) => ({ id: f.id, name: f.name, amount: f.amount, feeType: f.feeType })),
          originalPricePerNight: finalOriginal,
          pricePerNight: finalPrice,
          discountPercent: finalDiscountPct,
          discountLabel: finalDiscountLabel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cancelStalePendingBookings();
    const id = req.params.id as string;
    const today = new Date().toISOString().split('T')[0];

    const bookedRanges = await db
      .select({ checkIn: bookings.checkIn, checkOut: bookings.checkOut })
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, id),
          sql`${bookings.status} NOT IN ('cancelled')`,
          sql`${bookings.checkOut} >= ${today}::date`
        )
      );

    res.json({ status: 'success', data: { bookedRanges } });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const id = req.params.id as string;
    const { features: featuresList, fees, serviceFeePercent, ...updates } = req.body as UpdatePropertyInput & { features?: string[] };
    if (serviceFeePercent != null) (updates as any).serviceFeePercent = String(serviceFeePercent);

    const [existing] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);
    if (existing.ownerId !== req.user.userId) throw new AppError('You can only edit your own properties.', 403);

    const [updated] = await db.update(properties).set({ ...updates, updatedAt: new Date() }).where(eq(properties.id, id)).returning();

    if (featuresList) {
      await db.delete(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
      if (featuresList.length > 0) {
        await db.insert(propertyFeatures).values(featuresList.map((name: string) => ({ propertyId: id, featureName: name })));
      }
    }

    if (fees) {
      await db.delete(propertyFees).where(eq(propertyFees.propertyId, id));
      if (fees.length > 0) {
        await db.insert(propertyFees).values(fees.map((f) => ({ propertyId: id, name: f.name, amount: String(f.amount), feeType: f.feeType })));
      }
    }

    res.json({ status: 'success', message: 'Property updated successfully.', data: { property: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const id = req.params.id as string;

    const [existing] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);
    if (existing.ownerId !== req.user.userId) throw new AppError('You can only delete your own properties.', 403);

    const today = new Date().toISOString().split('T')[0];
    const futureBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.propertyId, id), sql`${bookings.status} NOT IN ('cancelled')`, sql`${bookings.checkOut} > ${today}::date`))
      .limit(1);

    if (futureBookings.length > 0) {
      throw new AppError('Cannot archive this property — it has upcoming bookings. Cancel or complete them first.', 400);
    }

    await db.update(properties).set({ status: 'archived', updatedAt: new Date() }).where(eq(properties.id, id));
    res.json({ status: 'success', message: 'Property archived successfully.' });
  } catch (error) {
    next(error);
  }
};
