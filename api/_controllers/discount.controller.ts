import { Request, Response, NextFunction } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../_db';
import { locationDiscounts } from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';

/** GET /api/admin/discounts — list all discounts */
export const getDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await db.select().from(locationDiscounts).orderBy(desc(locationDiscounts.createdAt));
    res.json({ status: 'success', data: { discounts: all } });
  } catch (error) {
    next(error);
  }
};

/** POST /api/admin/discounts — create a new location discount */
export const createDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationKeyword, discountPercent, label, startsAt, endsAt } = req.body;

    if (!locationKeyword?.trim()) throw new AppError('Location keyword is required.', 400);
    const pct = parseFloat(discountPercent);
    if (isNaN(pct) || pct <= 0 || pct >= 100) throw new AppError('Discount percent must be between 1 and 99.', 400);

    const [created] = await db
      .insert(locationDiscounts)
      .values({
        locationKeyword: locationKeyword.trim(),
        discountPercent: pct.toFixed(2),
        label: label?.trim() || null,
        isActive: true,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      })
      .returning();

    res.status(201).json({ status: 'success', message: 'Discount created.', data: { discount: created } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/discounts/:id — update (toggle active, change percent, etc.) */
export const updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { locationKeyword, discountPercent, label, isActive, startsAt, endsAt } = req.body;

    const [existing] = await db.select().from(locationDiscounts).where(eq(locationDiscounts.id, id)).limit(1);
    if (!existing) throw new AppError('Discount not found.', 404);

    const updates: any = { updatedAt: new Date() };
    if (locationKeyword !== undefined) updates.locationKeyword = locationKeyword.trim();
    if (discountPercent !== undefined) {
      const pct = parseFloat(discountPercent);
      if (isNaN(pct) || pct <= 0 || pct >= 100) throw new AppError('Discount percent must be between 1 and 99.', 400);
      updates.discountPercent = pct.toFixed(2);
    }
    if (label !== undefined) updates.label = label?.trim() || null;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (startsAt !== undefined) updates.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) updates.endsAt = endsAt ? new Date(endsAt) : null;

    const [updated] = await db.update(locationDiscounts).set(updates).where(eq(locationDiscounts.id, id)).returning();
    res.json({ status: 'success', message: 'Discount updated.', data: { discount: updated } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/discounts/:id — permanently delete a discount */
export const deleteDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const [existing] = await db.select().from(locationDiscounts).where(eq(locationDiscounts.id, id)).limit(1);
    if (!existing) throw new AppError('Discount not found.', 404);

    await db.delete(locationDiscounts).where(eq(locationDiscounts.id, id));
    res.json({ status: 'success', message: 'Discount deleted.' });
  } catch (error) {
    next(error);
  }
};
