import { Request, Response, NextFunction } from 'express';
import { eq, and, sql, desc, lt, count } from 'drizzle-orm';
import { db } from '../_db';
import { bookings, bookingAddons, properties, payments } from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';
import type { CreateBookingInput } from '../_validators/booking';

/**
 * POST /api/bookings
 * Authenticated — create a booking with concurrency-safe date validation.
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      numGuests,
      numRooms,
      specialRequests,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      addons,
    } = req.body as CreateBookingInput;

    // Verify property exists and is approved
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.status, 'approved')))
      .limit(1);

    if (!property) {
      throw new AppError('Property not found or not available.', 404);
    }

    // Reject bookings with check-in in the past (edge case 3.2)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(checkIn) < today) {
      throw new AppError('Check-in date cannot be in the past.', 400);
    }

    // Check guest count
    if (numGuests > (property.maxGuests || 99)) {
      throw new AppError(`This property allows a maximum of ${property.maxGuests} guests.`, 400);
    }

    // Calculate pricing
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    const basePrice = (parseFloat(property.pricePerNight) * nights * (numRooms || 1)).toFixed(2);
    const addonTotal = addons.reduce((sum, a) => sum + parseFloat(a.price), 0);
    const serviceFee = (parseFloat(basePrice) * 0.08).toFixed(2); // 8% service fee
    const totalPrice = (parseFloat(basePrice) + addonTotal + parseFloat(serviceFee)).toFixed(2);

    // Auto-cancel stale pending bookings older than 30 minutes (edge case 3.14)
    await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(bookings.propertyId, propertyId),
          eq(bookings.status, 'pending'),
          sql`${bookings.createdAt} < NOW() - INTERVAL '30 minutes'`
        )
      );

    // Atomic insert with overlap check to prevent concurrent double-booking (edge case 3.13)
    // This uses a single SQL statement so concurrent requests can't both pass the check
    const insertResult = await db.execute(sql`
      INSERT INTO bookings (id, user_id, property_id, check_in, check_out, num_guests, num_rooms, base_price, service_fee, total_price, status, special_requests, guest_first_name, guest_last_name, guest_email, guest_phone, created_at)
      SELECT gen_random_uuid(), ${req.user.userId}, ${propertyId}, ${checkIn}::date, ${checkOut}::date, ${numGuests}, ${numRooms || 1}, ${basePrice}::numeric, ${serviceFee}::numeric, ${totalPrice}::numeric, 'pending', ${specialRequests || null}, ${guestFirstName}, ${guestLastName}, ${guestEmail}, ${guestPhone || null}, now()
      WHERE NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE property_id = ${propertyId}
          AND status NOT IN ('cancelled')
          AND check_in < ${checkOut}::date
          AND check_out > ${checkIn}::date
      )
      RETURNING *
    `);

    if (!insertResult.rows || insertResult.rows.length === 0) {
      throw new AppError('These dates are already booked. Please choose different dates.', 409);
    }

    const newBooking = insertResult.rows[0] as any;

    if (addons.length > 0) {
      await db.insert(bookingAddons).values(
        addons.map((addon) => ({
          bookingId: newBooking.id as string,
          serviceName: addon.serviceName,
          price: addon.price,
        }))
      );
    }

    // Create a pending payment record
    await db.insert(payments).values({
      bookingId: newBooking.id as string,
      method: 'paymob',
      amount: totalPrice,
      status: 'pending',
    });


    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully.',
      data: {
        booking: {
          ...newBooking,
          nights,
          addonTotal: addonTotal.toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings
 * Authenticated — list current user's bookings with pagination (edge case 3.15).
 */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(bookings)
      .where(eq(bookings.userId, req.user.userId));

    const items = await db
      .select({
        id: bookings.id,
        propertyId: bookings.propertyId,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        numGuests: bookings.numGuests,
        numRooms: bookings.numRooms,
        basePrice: bookings.basePrice,
        serviceFee: bookings.serviceFee,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        createdAt: bookings.createdAt,
        propertyTitle: properties.title,
        propertyLocation: properties.locationName,
        propertyType: properties.propertyType,
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(eq(bookings.userId, req.user.userId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      status: 'success',
      data: {
        bookings: items,
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 * Authenticated — single booking detail (must be the booking owner).
 */
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const id = req.params.id as string;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    // Fetch add-ons
    const addons = await db
      .select()
      .from(bookingAddons)
      .where(eq(bookingAddons.bookingId, id));

    // Fetch payment
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, id))
      .limit(1);

    // Fetch property details
    let property = null;
    if (booking.propertyId) {
      const [prop] = await db
        .select({
          id: properties.id,
          title: properties.title,
          locationName: properties.locationName,
          propertyType: properties.propertyType,
          pricePerNight: properties.pricePerNight,
        })
        .from(properties)
        .where(eq(properties.id, booking.propertyId))
        .limit(1);
      property = prop || null;
    }

    res.json({
      status: 'success',
      data: {
        booking: {
          ...booking,
          addons,
          payment: payment || null,
          property,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Authenticated — cancel a pending or upcoming booking.
 */
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const id = req.params.id as string;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (!['pending', 'confirmed', 'upcoming'].includes(booking.status)) {
      throw new AppError(`Cannot cancel a booking with status "${booking.status}".`, 400);
    }

    // Cancellation policy: reject if check-in is within 48 hours (edge case 3.9)
    if (booking.status === 'confirmed' || booking.status === 'upcoming') {
      const checkInDate = new Date(booking.checkIn);
      const hoursUntilCheckIn = (checkInDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilCheckIn < 48) {
        throw new AppError(
          'Cancellation is not allowed within 48 hours of check-in. Please contact support for assistance.',
          400
        );
      }
    }

    const [updated] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully.',
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};
