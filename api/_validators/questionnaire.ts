import { z } from 'zod';

export const questionnaireSchema = z.object({
  locationPref: z.string().max(100).optional(),
  purpose: z.string().max(100).optional(),
  guests: z.number().int().min(1).optional(),
  roomsPref: z.string().max(20).optional(),
  budgetRange: z.string().max(50).optional(),
  durationPref: z.string().max(50).optional(),
  viewPref: z.string().max(50).optional(),
  amenities: z.array(z.string()).default([]),
}).refine(
  (data) => data.locationPref || data.budgetRange || data.viewPref || data.guests || data.roomsPref,
  { message: 'Please answer at least one preference question (location, budget, view, guests, or rooms).' }
);

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
