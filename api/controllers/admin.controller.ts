import { Request, Response, NextFunction } from 'express';
import { eq, sql, desc, and, count } from 'drizzle-orm';
import { db } from '../db';
import {
  users,
  properties,
  propertyImages,
  bookings,
  reviews,
  contactSubmissions,
} from '../db/schema';
import { AppError } from '../middleware/errorHandler';

/**
 * GET /api/admin/stats
 * Admin — aggregated dashboard statistics.
 */
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [bookingStats] = await db
      .select({
        total: count(),
        totalRevenue: sql<string>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      })
      .from(bookings);

    const [propertyStats] = await db
      .select({ total: count() })
      .from(properties)
      .where(eq(properties.status, 'approved'));

    const [pendingProperties] = await db
      .select({ total: count() })
      .from(properties)
      .where(eq(properties.status, 'pending_review'));

    const [userStats] = await db
      .select({ total: count() })
      .from(users);

    const [pendingReviews] = await db
      .select({ total: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));

    const [contactStats] = await db
      .select({ total: count() })
      .from(contactSubmissions);

    // Active bookings (confirmed or upcoming)
    const [activeBookings] = await db
      .select({ total: count() })
      .from(bookings)
      .where(sql`${bookings.status} IN ('confirmed', 'upcoming')`);

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
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/bookings
 * Admin — list ALL bookings with guest and property info.
 */
export const getAdminBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await db
      .select({ total: count() })
      .from(bookings);

    const items = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        numGuests: bookings.numGuests,
        totalPrice: bookings.totalPrice,
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
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      status: 'success',
      data: {
        bookings: items,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/properties
 * Admin — list ALL properties (all statuses) with owner info.
 */
export const getAdminProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const statusFilter = req.query.status as string | undefined;

    const conditions: any[] = [];
    if (statusFilter) {
      conditions.push(eq(properties.status, statusFilter as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(properties)
      .where(whereClause);

    const items = await db
      .select({
        id: properties.id,
        title: properties.title,
        propertyType: properties.propertyType,
        locationName: properties.locationName,
        pricePerNight: properties.pricePerNight,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        maxGuests: properties.maxGuests,
        status: properties.status,
        createdAt: properties.createdAt,
        ownerName: users.fullName,
        ownerEmail: users.email,
      })
      .from(properties)
      .leftJoin(users, eq(properties.ownerId, users.id))
      .where(whereClause)
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch hero images
    const propertyIds = items.map((p) => p.id);
    let images: any[] = [];
    if (propertyIds.length > 0) {
      images = await db
        .select()
        .from(propertyImages)
        .where(sql`${propertyImages.propertyId} IN ${propertyIds}`);
    }

    const propertiesWithImages = items.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id);
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];
      return { ...prop, heroImageUrl: heroImage?.imageUrl || null };
    });

    res.json({
      status: 'success',
      data: {
        properties: propertiesWithImages,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/status
 * Admin — approve or reject a property.
 */
export const updatePropertyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending_review', 'archived'].includes(status)) {
      throw new AppError('Invalid status. Must be: approved, rejected, pending_review, or archived.', 400);
    }

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    const [updated] = await db
      .update(properties)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();

    res.json({
      status: 'success',
      message: `Property status updated to "${status}".`,
      data: { property: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Admin — list all users.
 */
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await db
      .select({ total: count() })
      .from(users);

    const items = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        country: users.country,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      status: 'success',
      data: {
        users: items,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};
