import { Request, Response, NextFunction } from 'express';
import { eq, sql, desc, and, count } from 'drizzle-orm';
import { db } from '../_db';
import {
  users,
  properties,
  propertyImages,
  propertyFeatures,
  propertyFees,
  bookings,
  reviews,
  contactSubmissions,
} from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';
import { cancelStalePendingBookings } from './booking.controller';

/** GET /api/admin/stats */
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [bookingStats] = await db
      .select({ total: count(), totalRevenue: sql<string>`COALESCE(SUM(${bookings.totalPrice}), 0)` })
      .from(bookings);
    const [propertyStats] = await db.select({ total: count() }).from(properties).where(eq(properties.status, 'approved'));
    const [pendingProperties] = await db.select({ total: count() }).from(properties).where(eq(properties.status, 'pending_review'));
    const [userStats] = await db.select({ total: count() }).from(users);
    const [pendingReviews] = await db.select({ total: count() }).from(reviews).where(eq(reviews.status, 'pending'));
    const [contactStats] = await db.select({ total: count() }).from(contactSubmissions);
    const [activeBookings] = await db.select({ total: count() }).from(bookings).where(sql`${bookings.status} IN ('confirmed', 'upcoming')`);
    const [pendingDocs] = await db.select({ total: count() }).from(bookings).where(eq(bookings.docsStatus, 'submitted'));

    res.json({
      status: 'success',
      data: {
        totalBookings: Number(bookingStats.total),
        totalRevenue: parseFloat(bookingStats.totalRevenue as string) || 0,
        activeStays: Number(activeBookings.total),
        totalProperties: Number(propertyStats.total),
        pendingProperties: Number(pendingProperties.total),
        totalUsers: Number(userStats.total),
        pendingReviews: Number(pendingReviews.total),
        totalInquiries: Number(contactStats.total),
        pendingDocs: Number(pendingDocs.total),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/bookings */
export const getAdminBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cancelStalePendingBookings();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await db.select({ total: count() }).from(bookings);

    const items = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        numGuests: bookings.numGuests,
        totalPrice: bookings.totalPrice,
        depositAmount: bookings.depositAmount,
        depositPaid: bookings.depositPaid,
        remainingPaid: bookings.remainingPaid,
        docsStatus: bookings.docsStatus,
        hasFemaleGuest: bookings.hasFemaleGuest,
        bookingDocs: bookings.bookingDocs,
        status: bookings.status,
        guestFirstName: bookings.guestFirstName,
        guestLastName: bookings.guestLastName,
        guestEmail: bookings.guestEmail,
        guestPhone: bookings.guestPhone,
        createdAt: bookings.createdAt,
        propertyTitle: properties.title,
        propertyLocation: properties.locationName,
        userName: users.fullName,
        userEmail: users.email,
        userGender: users.gender,
        userAgeRange: users.ageRange,
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      status: 'success',
      data: { bookings: items, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/bookings
 * Admin manual booking / date block — no payment. Creates a confirmed,
 * fully-settled booking so the dates are unavailable to everyone else
 * (the public booking overlap check + availability query both treat any
 * non-cancelled booking as taken).
 */
export const adminCreateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId, checkIn, checkOut, note } = req.body || {};
    if (!propertyId || !checkIn || !checkOut) throw new AppError('Property and both dates are required.', 400);
    if (new Date(checkOut) <= new Date(checkIn)) throw new AppError('Check-out must be after check-in.', 400);

    const [property] = await db.select({ id: properties.id, title: properties.title }).from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!property) throw new AppError('Property not found.', 404);

    const label = (note && String(note).trim().slice(0, 250)) || 'Admin block';

    // Reject if any non-cancelled booking overlaps the requested range.
    const overlap = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, propertyId),
          sql`${bookings.status} <> 'cancelled'`,
          sql`${bookings.checkIn} < ${checkOut}::date`,
          sql`${bookings.checkOut} > ${checkIn}::date`
        )
      )
      .limit(1);
    if (overlap.length > 0) {
      throw new AppError('Those dates overlap an existing booking for this property.', 409);
    }

    // Confirmed, fully-settled booking with no payment, owned by no guest.
    const [created] = await db
      .insert(bookings)
      .values({
        propertyId,
        checkIn,
        checkOut,
        numGuests: 1,
        numRooms: 1,
        basePrice: '0',
        serviceFee: '0',
        totalPrice: '0',
        depositAmount: '0',
        depositPaid: true,
        remainingPaid: true,
        hasFemaleGuest: false,
        docsStatus: 'approved',
        status: 'confirmed',
        specialRequests: label,
        guestFirstName: 'Admin',
        guestLastName: 'Block',
      })
      .returning();

    res.status(201).json({
      status: 'success',
      message: `Dates blocked for "${property.title}".`,
      data: { booking: created },
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/bookings/:id/status */
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'upcoming', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new AppError(`Invalid status.`, 400);
    const [booking] = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking) throw new AppError('Booking not found.', 404);
    const [updated] = await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, id)).returning();
    res.json({ status: 'success', message: `Booking status updated.`, data: { booking: updated } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/bookings/:id/docs-status */
export const approveBookingDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) throw new AppError('Action must be "approve" or "reject".', 400);
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking) throw new AppError('Booking not found.', 404);
    const updates: any = action === 'approve'
      ? { docsStatus: 'approved', status: 'confirmed' }
      : { docsStatus: 'rejected' };
    const [updated] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    res.json({
      status: 'success',
      message: action === 'approve' ? 'Documents approved. Booking confirmed.' : 'Documents rejected.',
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/properties */
export const getAdminProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status as string | undefined;
    const conditions: any[] = [];
    if (statusFilter) conditions.push(eq(properties.status, statusFilter as any));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(properties).where(whereClause);
    const items = await db
      .select({
        id: properties.id, title: properties.title, propertyType: properties.propertyType,
        propertyTypeOther: properties.propertyTypeOther,
        locationName: properties.locationName, pricePerNight: properties.pricePerNight,
        discountPercent: properties.discountPercent, discountLabel: properties.discountLabel,
        minimumStay: properties.minimumStay, propertyLabel: properties.propertyLabel,
        bedrooms: properties.bedrooms, bathrooms: properties.bathrooms, maxGuests: properties.maxGuests,
        status: properties.status, createdAt: properties.createdAt,
        ownerName: users.fullName, ownerEmail: users.email,
        amenities: properties.amenities, houseRules: properties.houseRules,
        description: properties.description, viewType: properties.viewType,
        viewTypeOther: properties.viewTypeOther, isFurnished: properties.isFurnished,
        isFeatured: properties.isFeatured,
        offersHousekeeping: properties.offersHousekeeping, offersBeachAccess: properties.offersBeachAccess,
        beachAccessPrice: properties.beachAccessPrice,
        serviceFeePercent: properties.serviceFeePercent,
      })
      .from(properties).leftJoin(users, eq(properties.ownerId, users.id))
      .where(whereClause).orderBy(desc(properties.createdAt)).limit(limit).offset(offset);
    const propertyIds = items.map((p) => p.id);
    let images: any[] = [];
    let fees: any[] = [];
    if (propertyIds.length > 0) {
      images = await db.select().from(propertyImages).where(sql`${propertyImages.propertyId} IN ${propertyIds}`);
      fees = await db.select().from(propertyFees).where(sql`${propertyFees.propertyId} IN ${propertyIds}`);
    }
    const propertiesWithImages = items.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id)
        .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];
      return {
        ...prop,
        heroImageUrl: heroImage?.imageUrl || null,
        images: propImages.map((img: any) => ({ id: img.id, imageUrl: img.imageUrl, isHero: !!img.isHero, displayOrder: img.displayOrder ?? 0 })),
        fees: fees.filter((f) => f.propertyId === prop.id).map((f: any) => ({ id: f.id, name: f.name, amount: f.amount, feeType: f.feeType })),
      };
    });
    res.json({ status: 'success', data: { properties: propertiesWithImages, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/properties/:id/status */
export const updatePropertyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending_review', 'archived'].includes(status)) throw new AppError('Invalid status.', 400);
    const [property] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    if (!property) throw new AppError('Property not found.', 404);
    const [updated] = await db.update(properties).set({ status: status as any, updatedAt: new Date() }).where(eq(properties.id, id)).returning();
    res.json({ status: 'success', message: `Property status updated to "${status}".`, data: { property: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/edit
 * Admin-only — full property edit regardless of status.
 * Supports: title, price, discountPercent, discountLabel, minimumStay, propertyLabel,
 *           amenities, houseRules, description, propertyType, viewType, isFurnished,
 *           bedrooms, bathrooms, maxGuests, propertyTypeOther, viewTypeOther
 */
export const adminUpdateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);

    const {
      title, pricePerNight, discountPercent, discountLabel,
      minimumStay, propertyLabel, amenities, houseRules, description,
      propertyType, propertyTypeOther, viewType, viewTypeOther,
      isFurnished, bedrooms, bathrooms, maxGuests, features, fees, newImageUrls,
      offersHousekeeping, offersBeachAccess, beachAccessPrice, serviceFeePercent,
    } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (pricePerNight !== undefined) updates.pricePerNight = String(pricePerNight);
    if (discountPercent !== undefined) updates.discountPercent = discountPercent ? String(discountPercent) : null;
    if (discountLabel !== undefined) updates.discountLabel = discountLabel || null;
    if (minimumStay !== undefined) updates.minimumStay = Number(minimumStay) || 1;
    if (propertyLabel !== undefined) updates.propertyLabel = propertyLabel || null;
    if (amenities !== undefined) updates.amenities = amenities;
    if (houseRules !== undefined) updates.houseRules = houseRules;
    if (description !== undefined) updates.description = description;
    if (propertyType !== undefined) updates.propertyType = propertyType;
    if (propertyTypeOther !== undefined) updates.propertyTypeOther = propertyTypeOther || null;
    if (viewType !== undefined) updates.viewType = viewType || null;
    if (viewTypeOther !== undefined) updates.viewTypeOther = viewTypeOther || null;
    if (isFurnished !== undefined) updates.isFurnished = Boolean(isFurnished);
    if (bedrooms !== undefined) updates.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updates.bathrooms = Number(bathrooms);
    if (maxGuests !== undefined) updates.maxGuests = Number(maxGuests);
    if (offersHousekeeping !== undefined) updates.offersHousekeeping = Boolean(offersHousekeeping);
    if (offersBeachAccess !== undefined) updates.offersBeachAccess = Boolean(offersBeachAccess);
    if (beachAccessPrice !== undefined && beachAccessPrice !== '') updates.beachAccessPrice = String(beachAccessPrice);
    if (serviceFeePercent !== undefined && serviceFeePercent !== '') updates.serviceFeePercent = String(serviceFeePercent);

    const [updated] = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();

    // Update features if provided
    if (features !== undefined) {
      await db.delete(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
      if (Array.isArray(features) && features.length > 0) {
        await db.insert(propertyFeatures).values(features.map((name: string) => ({ propertyId: id, featureName: name })));
      }
    }

    // Update extra fees if provided (replace the full set)
    if (fees !== undefined) {
      await db.delete(propertyFees).where(eq(propertyFees.propertyId, id));
      if (Array.isArray(fees) && fees.length > 0) {
        await db.insert(propertyFees).values(
          fees
            .filter((f: any) => f && f.name && f.amount !== '' && f.amount != null)
            .map((f: any) => ({
              propertyId: id,
              name: String(f.name).slice(0, 120),
              amount: String(f.amount),
              feeType: f.feeType === 'per_night' ? 'per_night' : 'per_stay',
            }))
        );
      }
    }

    // Append newly-uploaded images
    if (Array.isArray(newImageUrls) && newImageUrls.length > 0) {
      const existingImgs = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id));
      const hasHero = existingImgs.some((img: any) => img.isHero);
      const startOrder = existingImgs.reduce((max: number, img: any) => Math.max(max, img.displayOrder ?? 0), -1) + 1;
      await db.insert(propertyImages).values(
        newImageUrls
          .filter((u: any) => typeof u === 'string' && u)
          .map((url: string, i: number) => ({
            propertyId: id,
            imageUrl: url,
            isHero: !hasHero && i === 0, // first image becomes hero if none exists yet
            displayOrder: startOrder + i,
          }))
      );
    }

    // Return the current image set so the UI can refresh
    const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id)).orderBy(propertyImages.displayOrder);

    res.json({
      status: 'success',
      message: 'Property updated.',
      data: { property: { ...updated, images: images.map((img: any) => ({ id: img.id, imageUrl: img.imageUrl, isHero: !!img.isHero, displayOrder: img.displayOrder ?? 0 })) } },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/users — includes gender + ageRange */
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const [{ total }] = await db.select({ total: count() }).from(users);
    const items = await db
      .select({
        id: users.id, fullName: users.fullName, email: users.email,
        phone: users.phone, country: users.country,
        gender: users.gender, ageRange: users.ageRange,
        isAdmin: users.isAdmin, createdAt: users.createdAt,
      })
      .from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    res.json({ status: 'success', data: { users: items, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/properties/:id/featured — toggle featured flag */
export const toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { isFeatured } = req.body;
    if (typeof isFeatured !== 'boolean') throw new AppError('isFeatured must be a boolean.', 400);
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);
    const [updated] = await db.update(properties).set({ isFeatured, updatedAt: new Date() }).where(eq(properties.id, id)).returning({ id: properties.id, isFeatured: properties.isFeatured });
    res.json({ status: 'success', message: `Property ${isFeatured ? 'featured' : 'unfeatured'}.`, data: { property: updated } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/properties/:id — permanently delete a property (admin only).
 *  FK cascades remove images, features and reviews; bookings keep their record
 *  with property_id set to NULL (onDelete: 'set null'). */
export const adminDeleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);
    await db.delete(properties).where(eq(properties.id, id));
    res.json({ status: 'success', message: 'Property deleted permanently.', data: { id } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/contacts */
export const getAdminContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;
    const [{ total }] = await db.select({ total: count() }).from(contactSubmissions);
    const items = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset);
    res.json({ status: 'success', data: { contacts: items, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/properties/:id/hero-image — set cover photo */
export const setHeroImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.id as string;
    const { imageId } = req.body;
    if (!imageId) throw new AppError('imageId is required.', 400);

    // Verify property exists
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);

    // Verify image belongs to this property
    const [image] = await db.select().from(propertyImages).where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId))).limit(1);
    if (!image) throw new AppError('Image not found for this property.', 404);

    // Unset all hero flags for this property, then set the chosen one
    await db.update(propertyImages).set({ isHero: false }).where(eq(propertyImages.propertyId, propertyId));
    await db.update(propertyImages).set({ isHero: true }).where(eq(propertyImages.id, imageId));

    res.json({ status: 'success', message: 'Cover photo updated.' });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/properties/:id/images/:imageId — delete a specific image */
export const deletePropertyImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.id as string;
    const imageId = req.params.imageId as string;

    // Verify property exists
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!existing) throw new AppError('Property not found.', 404);

    // Verify image belongs to this property
    const [image] = await db.select().from(propertyImages).where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId))).limit(1);
    if (!image) throw new AppError('Image not found.', 404);

    const wasHero = image.isHero;
    await db.delete(propertyImages).where(eq(propertyImages.id, imageId));

    // If the deleted image was the hero, promote the first remaining image
    if (wasHero) {
      const remaining = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(propertyImages.displayOrder).limit(1);
      if (remaining.length > 0) {
        await db.update(propertyImages).set({ isHero: true }).where(eq(propertyImages.id, remaining[0].id));
      }
    }

    res.json({ status: 'success', message: 'Image deleted.' });
  } catch (error) {
    next(error);
  }
};
