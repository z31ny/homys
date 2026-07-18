import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../_db';
import { bookings, payments, users } from '../_db/schema';
import { config } from '../_config';
import { AppError } from '../_middleware/errorHandler';

const PAYMOB_INTENTION_URL = 'https://accept.paymob.com/v1/intention/';
const PAYMOB_CHECKOUT_URL = 'https://accept.paymob.com/unifiedcheckout/';

function gatewayReady(): boolean {
  return !!(config.paymob.secretKey && config.paymob.publicKey && config.paymob.integrationId);
}

function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = (fullName || 'Guest').trim().split(/\s+/);
  return { firstName: parts[0] || 'Guest', lastName: parts.slice(1).join(' ') || 'User' };
}

// special_reference encodes the booking + payment kind, with a timestamp so it
// stays unique across retries. UUIDs use single hyphens, so '--' is a safe delimiter.
function buildRef(bookingId: string, kind: 'dep' | 'rem'): string {
  return `homys--${bookingId}--${kind}--${Date.now()}`;
}
function parseRef(ref: string): { bookingId: string; isRemaining: boolean } {
  const p = (ref || '').split('--');
  if (p[0] !== 'homys') {
    // Backwards-compat with the legacy "<id>" / "<id>|remaining" reference
    const isRemaining = ref.includes('|remaining');
    return { bookingId: isRemaining ? ref.replace('|remaining', '') : ref, isRemaining };
  }
  return { bookingId: p[1] || '', isRemaining: p[2] === 'rem' };
}

/**
 * Creates a Paymob payment intention (new Unified Checkout / "Flash" flow) and
 * returns the hosted Unified Checkout URL the guest is redirected to.
 */
async function createCheckoutUrl(opts: {
  amountCents: number; bookingId: string; kind: 'dep' | 'rem';
  firstName: string; lastName: string; email: string; phone: string; itemName: string;
}): Promise<string> {
  const res = await fetch(PAYMOB_INTENTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${config.paymob.secretKey}` },
    body: JSON.stringify({
      amount: opts.amountCents,
      currency: 'EGP',
      payment_methods: [parseInt(config.paymob.integrationId, 10)],
      items: [{ name: opts.itemName, amount: opts.amountCents, quantity: 1 }],
      billing_data: {
        apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA',
        first_name: opts.firstName, last_name: opts.lastName,
        phone_number: opts.phone, email: opts.email,
        city: 'Cairo', state: 'Cairo', country: 'EG', postal_code: 'NA',
      },
      customer: { first_name: opts.firstName, last_name: opts.lastName, email: opts.email },
      extras: { booking_id: opts.bookingId, kind: opts.kind },
      special_reference: buildRef(opts.bookingId, opts.kind),
      redirection_url: `${config.frontendUrl}/api/payments/callback`,
      notification_url: `${config.frontendUrl}/api/payments/webhook`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[Paymob] Create intention failed:', res.status, text);
    throw new AppError('Failed to start payment. Please try again.', 502);
  }
  const data = await res.json();
  if (!data.client_secret) throw new AppError('Payment gateway did not return a checkout session.', 502);
  return `${PAYMOB_CHECKOUT_URL}?publicKey=${config.paymob.publicKey}&clientSecret=${data.client_secret}`;
}

/**
 * POST /api/payments/initiate
 * Starts the 50% deposit payment and returns the Unified Checkout URL.
 */
export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const { bookingId } = req.body;
    if (!bookingId) throw new AppError('Booking ID is required.', 400);
    if (!gatewayReady()) throw new AppError('Payment gateway not configured.', 503);

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.status !== 'pending') throw new AppError(`Cannot pay for a booking with status "${booking.status}".`, 400);
    if (booking.depositPaid) throw new AppError('Deposit has already been paid.', 400);

    const [user] = await db
      .select({ fullName: users.fullName, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    const { firstName, lastName } = splitName(user?.fullName);
    const depositAmount = booking.depositAmount
      ? parseFloat(booking.depositAmount as string)
      : parseFloat(booking.totalPrice as string) * 0.5;
    const amountCents = Math.round(depositAmount * 100);

    const checkoutUrl = await createCheckoutUrl({
      amountCents, bookingId, kind: 'dep',
      firstName, lastName,
      email: user?.email || booking.guestEmail || 'guest@homyshospitality.com',
      phone: user?.phone || booking.guestPhone || '+201000000000',
      itemName: `Deposit - Booking ${bookingId.slice(0, 8)}`,
    });

    res.json({ status: 'success', data: { checkoutUrl } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/initiate-remaining
 * Starts the remaining 50% payment (after documents are approved).
 */
export const initiateRemainingPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);
    const { bookingId } = req.body;
    if (!bookingId) throw new AppError('Booking ID is required.', 400);
    if (!gatewayReady()) throw new AppError('Payment gateway not configured.', 503);

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, req.user.userId)))
      .limit(1);

    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.docsStatus !== 'approved') throw new AppError('Documents must be approved before paying the remaining balance.', 400);
    if (!booking.depositPaid) throw new AppError('Deposit must be paid first.', 400);
    if (booking.remainingPaid) throw new AppError('Remaining balance has already been paid.', 400);

    const [user] = await db
      .select({ fullName: users.fullName, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    const { firstName, lastName } = splitName(user?.fullName);
    const totalPrice = parseFloat(booking.totalPrice as string);
    const depositAmount = booking.depositAmount ? parseFloat(booking.depositAmount as string) : totalPrice * 0.5;
    const remainingAmount = totalPrice - depositAmount;
    const amountCents = Math.round(remainingAmount * 100);

    const checkoutUrl = await createCheckoutUrl({
      amountCents, bookingId, kind: 'rem',
      firstName, lastName,
      email: user?.email || booking.guestEmail || 'guest@homyshospitality.com',
      phone: user?.phone || booking.guestPhone || '+201000000000',
      itemName: `Remaining 50% - Booking ${bookingId.slice(0, 8)}`,
    });

    await db.insert(payments).values({ bookingId, method: 'paymob', amount: remainingAmount.toFixed(2), status: 'pending' });

    res.json({ status: 'success', data: { checkoutUrl, remainingAmount } });
  } catch (error) {
    next(error);
  }
};

// ─── HMAC verification (Paymob transaction signature, SHA-512) ──────────────
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
  'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
  'is_standalone_payment', 'is_voided', 'order', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
];

/**
 * Concatenate from the flat redirect-callback query. Paymob sends dotted keys
 * (e.g. "source_data.pan"); some setups use underscores — try both.
 */
function hmacFromCallbackQuery(q: any): string {
  const concat = HMAC_FIELDS
    .map((f) => q[f] ?? q[f.replace('.', '_')] ?? '')
    .join('');
  return crypto.createHmac('sha512', config.paymob.hmacSecret).update(concat).digest('hex');
}

/** Concatenate from the nested webhook transaction object. */
function hmacFromWebhookObj(t: any): string {
  const get = (f: string) => {
    if (f === 'order') return t.order?.id;
    if (f.includes('.')) {
      const [a, b] = f.split('.');
      return t[a]?.[b];
    }
    return t[f];
  };
  const concat = HMAC_FIELDS.map((f) => get(f)).join('');
  return crypto.createHmac('sha512', config.paymob.hmacSecret).update(concat).digest('hex');
}

/**
 * GET /api/payments/callback
 * Paymob redirects the guest here after the Unified Checkout. HMAC-verified.
 */
export const paymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  const frontendUrl = config.frontendUrl;
  try {
    const q: any = req.query;
    const success = q.success === 'true';
    const transactionId = (q.id as string) || '';
    const merchantOrderId = (q.merchant_order_id as string) || '';
    const { bookingId, isRemaining } = parseRef(merchantOrderId);

    // Verify the redirect signature. We only let a VERIFIED callback write to the
    // DB; if it can't be verified we still route the user correctly and let the
    // HMAC-enforced server-to-server webhook be the source of truth (so a bad
    // signature never strands the guest on an error page after a real payment).
    let hmacValid = true;
    if (config.paymob.hmacSecret) {
      const expected = hmacFromCallbackQuery(q);
      hmacValid = !!q.hmac && expected === q.hmac;
      if (!hmacValid) console.error('[Paymob] Callback HMAC mismatch', { expected, got: q.hmac });
    }

    if (!bookingId) return res.redirect(frontendUrl);

    if (success) {
      if (hmacValid) {
        if (isRemaining) {
          await db.update(bookings).set({ remainingPaid: true, status: 'confirmed' }).where(eq(bookings.id, bookingId));
        } else {
          await db.update(bookings).set({ depositPaid: true }).where(eq(bookings.id, bookingId));
        }
        await db.update(payments).set({ status: 'success', paymobTransactionId: transactionId }).where(eq(payments.bookingId, bookingId));
      }
      return res.redirect(isRemaining
        ? `${frontendUrl}/profile?paymentSuccess=remaining`
        : `${frontendUrl}/booking-docs?bookingId=${bookingId}`);
    }

    if (hmacValid) {
      await db.update(payments).set({ status: 'failed', paymobTransactionId: transactionId }).where(eq(payments.bookingId, bookingId));
    }
    return res.redirect(`${frontendUrl}/payment?error=failed&bookingId=${bookingId}`);
  } catch (error) {
    console.error('[Paymob] Callback error:', error);
    return res.redirect(`${frontendUrl}/payment?error=unknown`);
  }
};

/**
 * POST /api/payments/webhook
 * Paymob server-to-server confirmation — the trusted source of truth.
 * HMAC is ENFORCED: a failed/missing signature is ignored (no DB change).
 */
export const paymentWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, obj } = req.body || {};
    if (type !== 'TRANSACTION' || !obj) return res.status(200).json({ received: true });

    if (config.paymob.hmacSecret) {
      const expected = hmacFromWebhookObj(obj);
      const received = (req.query.hmac as string) || (req.body?.hmac as string) || '';
      if (!received || expected !== received) {
        console.error('[Paymob Webhook] HMAC mismatch — ignoring', { expected, got: received });
        return res.status(200).json({ received: true });
      }
    }

    const success = obj.success === true;
    const merchantOrderId = obj.order?.merchant_order_id || '';
    const transactionId = String(obj.id || '');
    const { bookingId, isRemaining } = parseRef(merchantOrderId);
    if (!bookingId) return res.status(200).json({ received: true });

    if (success) {
      if (isRemaining) {
        await db.update(bookings).set({ remainingPaid: true, status: 'confirmed' }).where(eq(bookings.id, bookingId));
      } else {
        await db.update(bookings).set({ depositPaid: true }).where(eq(bookings.id, bookingId));
      }
      await db.update(payments).set({ status: 'success', paymobTransactionId: transactionId }).where(eq(payments.bookingId, bookingId));
      console.log(`[Paymob Webhook] ${isRemaining ? 'Remaining' : 'Deposit'} paid for booking ${bookingId}`);
    } else {
      await db.update(payments).set({ status: 'failed', paymobTransactionId: transactionId }).where(eq(payments.bookingId, bookingId));
      console.log(`[Paymob Webhook] Payment failed for booking ${bookingId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Paymob Webhook] Error:', error);
    res.status(200).json({ received: true });
  }
};
