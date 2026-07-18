import { Request, Response, NextFunction } from 'express';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { db } from '../_db';
import { bookings, bookingAddons, properties, payments } from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';
import type { CreateBookingInput } from '../_validators/booking';

/**
 * Cancels every 'pending' booking that is older than 10 minutes AND has not
 * paid its deposit — globally, not just for one property. Deposit-paid bookings
 * (which sit in 'pending' until docs are approved) are intentionally spared.
 *
 * There is no always-on worker on serverless, so this runs opportunistically
 * whenever bookings/availability are read or a new booking is created.
 */
export async function cancelStalePendingBookings() {
  await db.update(bookings).set({ status: 'cancelled' }).where(
    and(
      eq(bookings.status, 'pending'),
      eq(bookings.depositPaid, false),
      sql`${bookings.createdAt} < NOW() - INTERVAL '10 minutes'`
    )
  );
}

/**
 * POST /api/bookings
 * Creates a booking and calculates a 50% deposit.
 * Guest pays deposit first; booking stays pending until docs approved.
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);

    const {
      propertyId, checkIn, checkOut, numGuests, numRooms,
      specialRequests, guestFirstName, guestLastName,
      guestEmail, guestPhone, addons, hasFemaleGuest,
    } = req.body as CreateBookingInput & { hasFemaleGuest?: boolean };

    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.status, 'approved')))
      .limit(1);

    if (!property) throw new AppError('Property not found or not available.', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(checkIn) < today) throw new AppError('Check-in date cannot be in the past.', 400);
    if (numGuests > (property.maxGuests || 99)) throw new AppError(`Maximum ${property.maxGuests} guests allowed.`, 400);

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    const rooms = numRooms || 1;
    const pricePerNight = parseFloat(property.pricePerNight);
    const basePriceNum = pricePerNight * nights * rooms;

    // Mandatory extra fees — computed server-side (client-sent addons are ignored).
    const weeks = Math.max(1, Math.ceil(nights / 7));
    const mandatoryFees: { serviceName: string; price: number }[] = [
      // Refundable insurance = one night's price, returned to the guest at check-out
      { serviceName: 'Insurance (refundable on check-out)', price: pricePerNight * rooms },
    ];
    if (property.offersHousekeeping) mandatoryFees.push({ serviceName: 'Housekeeping', price: 2000 });
    if (property.offersBeachAccess) {
      const beachRate = property.beachAccessPrice != null ? parseFloat(property.beachAccessPrice as any) : 2000;
      mandatoryFees.push({ serviceName: 'Beach Access (weekly, per guest)', price: beachRate * weeks * numGuests });
    }
    const addonTotal = mandatoryFees.reduce((s, f) => s + f.price, 0);

    // Per-property service fee % (default 10) on the booking base only
    const feePct = property.serviceFeePercent != null ? parseFloat(property.serviceFeePercent as any) : 10;
    const basePrice = basePriceNum.toFixed(2);
    const serviceFee = (basePriceNum * feePct / 100).toFixed(2);
    const totalPrice = (basePriceNum + addonTotal + parseFloat(serviceFee)).toFixed(2);
    // 50% deposit
    const depositAmount = (parseFloat(totalPrice) * 0.5).toFixed(2);

    // Release any stale unpaid holds (global, deposit-aware) before booking
    await cancelStalePendingBookings();

    // Atomic insert with overlap check
    const insertResult = await db.execute(sql`
      INSERT INTO bookings (
        id, user_id, property_id, check_in, check_out,
        num_guests, num_rooms, base_price, service_fee, total_price,
        deposit_amount, deposit_paid, has_female_guest, docs_status,
        status, special_requests, guest_first_name, guest_last_name,
        guest_email, guest_phone, created_at
      )
      SELECT
        gen_random_uuid(), ${req.user.userId}, ${propertyId},
        ${checkIn}::date, ${checkOut}::date,
        ${numGuests}, ${numRooms || 1},
        ${basePrice}::numeric, ${serviceFee}::numeric, ${totalPrice}::numeric,
        ${depositAmount}::numeric, false, ${hasFemaleGuest ?? false}, 'pending',
        'pending', ${specialRequests || null},
        ${guestFirstName}, ${guestLastName}, ${guestEmail}, ${guestPhone || null}, now()
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

    if (mandatoryFees.length > 0) {
      await db.insert(bookingAddons).values(
        mandatoryFees.map((f) => ({
          bookingId: newBooking.id as string,
          serviceName: f.serviceName,
          price: f.price.toFixed(2),
        }))
      );
    }

    // Create a pending payment record for the deposit amount
    await db.insert(payments).values({
      bookingId: newBooking.id as string,
      method: 'paymob',
      amount: depositAmount,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created. Please pay the 50% deposit to confirm your reservation.',
      data: {
        booking: {
          id: newBooking.id,
          userId: newBooking.user_id,
          propertyId: newBooking.property_id,
          checkIn: newBooking.check_in,
          checkOut: newBooking.check_out,
          numGuests: newBooking.num_guests,
          basePrice: newBooking.base_price,
          serviceFee: newBooking.service_fee,
          totalPrice: newBooking.total_price,
          depositAmount: newBooking.deposit_amount,
          depositPaid: newBooking.deposit_paid,
          hasFemaleGuest: newBooking.has_female_guest,
          docsStatus: newBooking.docs_status,
          status: newBooking.status,
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
 * POST /api/bookings/:id/docs
 * Authenticated — upload identity documents for a booking.
 * Accepts pre-uploaded image URLs + metadata.
 */
export const submitBookingDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const id = req.params.id as string;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.status === 'cancelled') throw new AppError('Cannot submit docs for a cancelled booking.', 400);

    const { docs, hasFemaleGuest } = req.body;
    if (!docs || !Array.isArray(docs) || docs.length === 0) {
      throw new AppError('Please provide at least one document.', 400);
    }

    // Validate doc shape
    const validTypes = ['national_id', 'passport', 'marriage_cert'];
    for (const doc of docs) {
      if (!doc.type || !validTypes.includes(doc.type)) throw new AppError(`Invalid document type: ${doc.type}`, 400);
      if (!doc.url) throw new AppError('Each document must include a URL.', 400);
    }

    const [updated] = await db
      .update(bookings)
      .set({
        bookingDocs: docs,
        hasFemaleGuest: hasFemaleGuest ?? booking.hasFemaleGuest,
        docsStatus: 'submitted',
      })
      .where(eq(bookings.id, id))
      .returning();

    res.json({
      status: 'success',
      message: 'Documents submitted. Awaiting admin review.',
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings
 */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    await cancelStalePendingBookings();

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const [{ total }] = await db.select({ total: count() }).from(bookings).where(eq(bookings.userId, req.user.userId));

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
        depositAmount: bookings.depositAmount,
        depositPaid: bookings.depositPaid,
        remainingPaid: bookings.remainingPaid,
        docsStatus: bookings.docsStatus,
        hasFemaleGuest: bookings.hasFemaleGuest,
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
      data: { bookings: items, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 */
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const id = req.params.id as string;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) throw new AppError('Booking not found.', 404);

    const addons = await db.select().from(bookingAddons).where(eq(bookingAddons.bookingId, id));
    const [payment] = await db.select().from(payments).where(eq(payments.bookingId, id)).limit(1);

    let property = null;
    if (booking.propertyId) {
      const [prop] = await db
        .select({ id: properties.id, title: properties.title, locationName: properties.locationName, propertyType: properties.propertyType, pricePerNight: properties.pricePerNight })
        .from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      property = prop || null;
    }

    res.json({ status: 'success', data: { booking: { ...booking, addons, payment: payment || null, property } } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const id = req.params.id as string;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) throw new AppError('Booking not found.', 404);
    if (!['pending', 'confirmed', 'upcoming'].includes(booking.status)) {
      throw new AppError(`Cannot cancel a booking with status "${booking.status}".`, 400);
    }

    if (booking.status === 'confirmed' || booking.status === 'upcoming') {
      const hoursUntilCheckIn = (new Date(booking.checkIn).getTime() - Date.now()) / 3600000;
      if (hoursUntilCheckIn < 48) throw new AppError('Cancellation not allowed within 48 hours of check-in.', 400);
    }

    const [updated] = await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, id)).returning();
    res.json({ status: 'success', message: 'Booking cancelled.', data: { booking: updated } });
  } catch (error) {
    next(error);
  }
};
