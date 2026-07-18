import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../_db';
import { websiteContent } from '../_db/schema';
import { AppError } from '../_middleware/errorHandler';

/** GET /api/content/:section — public */
export const getSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = req.params.section as string;
    const [row] = await db.select().from(websiteContent).where(eq(websiteContent.section, section)).limit(1);
    // A missing section just means "no overrides saved yet" — return empty
    // content (200) so the frontend falls back to its defaults instead of
    // logging a 404 for every un-seeded section (e.g. global_nav).
    if (!row) {
      res.json({ status: 'success', data: { section, content: {}, updatedAt: null } });
      return;
    }
    res.json({ status: 'success', data: { section: row.section, content: row.content, updatedAt: row.updatedAt } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/content — public — list all sections */
export const getAllSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db.select().from(websiteContent);
    res.json({ status: 'success', data: { sections: rows } });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/content/:section — admin only */
export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = req.params.section as string;
    const { content } = req.body;
    if (!content || typeof content !== 'object') throw new AppError('Content must be an object.', 400);

    const [existing] = await db.select().from(websiteContent).where(eq(websiteContent.section, section)).limit(1);

    let row;
    if (existing) {
      [row] = await db
        .update(websiteContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(websiteContent.section, section))
        .returning();
    } else {
      [row] = await db
        .insert(websiteContent)
        .values({ section, content })
        .returning();
    }

    res.json({ status: 'success', message: 'Section updated.', data: { section: row } });
  } catch (error) {
    next(error);
  }
};
