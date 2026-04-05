import { Request, Response, NextFunction } from 'express';
import { eq, and, gte, lte, like, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { questionnaireResponses, properties, propertyImages } from '../db/schema';
import type { QuestionnaireInput } from '../validators/questionnaire';

/**
 * Map frontend budget IDs to price ranges.
 */
const BUDGET_MAP: Record<string, { min: number; max: number }> = {
  Eco: { min: 0, max: 150 },
  Mid: { min: 150, max: 400 },
  Lux: { min: 400, max: 800 },
  Elite: { min: 1500, max: 999999 },
};

/**
 * Map frontend view preferences to schema enum values.
 */
const VIEW_MAP: Record<string, string> = {
  Sea: 'sea',
  Pool: 'pool',
  Garden: 'garden',
  City: 'city',
};

/**
 * POST /api/questionnaire
 * Optional auth — saves questionnaire response and returns matching properties.
 */
export const submitQuestionnaire = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as QuestionnaireInput;

    // Save the response
    const [response] = await db
      .insert(questionnaireResponses)
      .values({
        userId: req.user?.userId || null,
        locationPref: data.locationPref || null,
        purpose: data.purpose || null,
        guests: data.guests || null,
        roomsPref: data.roomsPref?.toString() || null,
        budgetRange: data.budgetRange || null,
        durationPref: data.durationPref || null,
        viewPref: data.viewPref || null,
        amenities: data.amenities,
      })
      .returning({ id: questionnaireResponses.id });

    // Build query to find matching approved properties
    const conditions = [eq(properties.status, 'approved')];

    // Location filter
    if (data.locationPref) {
      conditions.push(like(properties.locationName, `%${data.locationPref}%`));
    }

    // View preference
    if (data.viewPref && VIEW_MAP[data.viewPref]) {
      conditions.push(eq(properties.viewType, VIEW_MAP[data.viewPref] as any));
    }

    // Budget range
    if (data.budgetRange && BUDGET_MAP[data.budgetRange]) {
      const { min, max } = BUDGET_MAP[data.budgetRange];
      conditions.push(gte(properties.pricePerNight, min.toString()));
      conditions.push(lte(properties.pricePerNight, max.toString()));
    }

    // Guest capacity
    if (data.guests) {
      conditions.push(gte(properties.maxGuests, data.guests));
    }

    // Bedrooms
    if (data.roomsPref) {
      const roomNum = parseInt(data.roomsPref.toString().replace('+', ''), 10);
      if (!isNaN(roomNum)) {
        conditions.push(gte(properties.bedrooms, roomNum));
      }
    }

    // Fetch matching properties (top 6)
    const matches = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt))
      .limit(6);

    // Fetch hero images for matched properties
    const matchIds = matches.map((p) => p.id);
    let images: any[] = [];
    if (matchIds.length > 0) {
      images = await db
        .select()
        .from(propertyImages)
        .where(sql`${propertyImages.propertyId} IN ${matchIds}`);
    }

    const matchesWithImages = matches.map((prop) => {
      const propImages = images.filter((img) => img.propertyId === prop.id);
      const heroImage = propImages.find((img) => img.isHero) || propImages[0];
      return {
        id: prop.id,
        title: prop.title,
        locationName: prop.locationName,
        pricePerNight: prop.pricePerNight,
        propertyType: prop.propertyType,
        bedrooms: prop.bedrooms,
        viewType: prop.viewType,
        heroImageUrl: heroImage?.imageUrl || null,
      };
    });

    res.status(201).json({
      status: 'success',
      message: `Found ${matches.length} matching properties.`,
      data: {
        responseId: response.id,
        matches: matchesWithImages,
      },
    });
  } catch (error) {
    next(error);
  }
};
