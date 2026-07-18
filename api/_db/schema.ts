import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const ageRangeEnum = pgEnum('age_range', ['18-25', '26-35', '36-50', '50+']);
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'villa', 'chalet', 'studio', 'other']);
export const propertyStatusEnum = pgEnum('property_status', ['pending_review', 'approved', 'rejected', 'archived']);
export const viewTypeEnum = pgEnum('view_type', ['sea', 'pool', 'garden', 'city', 'lagoon', 'other']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'upcoming', 'completed', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'paymob']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'success', 'failed', 'refunded']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: varchar('phone', { length: 30 }),
  gender: genderEnum('gender'),
  ageRange: ageRangeEnum('age_range'),
  country: varchar('country', { length: 100 }),
  profileImageUrl: text('profile_image_url'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  projectName: varchar('project_name', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  propertyTypeOther: varchar('property_type_other', { length: 100 }), // custom type when propertyType='other'
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  sqft: integer('sqft'),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }),
  discountLabel: varchar('discount_label', { length: 255 }),
  isFurnished: boolean('is_furnished').default(false),
  isFeatured: boolean('is_featured').default(false).notNull(),
  description: text('description'),
  houseRules: jsonb('house_rules').$type<string[]>().default([]),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  locationName: varchar('location_name', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  nearbyEssentials: jsonb('nearby_essentials').$type<string[]>().default([]),
  maxGuests: integer('max_guests').default(2),
  // Mandatory extra fees this property charges (auto-added at checkout)
  offersHousekeeping: boolean('offers_housekeeping').default(false).notNull(),
  offersBeachAccess: boolean('offers_beach_access').default(false).notNull(),
  // Beach-access rate charged per week, per guest (admin-set per property)
  beachAccessPrice: decimal('beach_access_price', { precision: 10, scale: 2 }).default('2000').notNull(),
  // Service fee percentage applied to the booking base (admin-set per property)
  serviceFeePercent: decimal('service_fee_percent', { precision: 5, scale: 2 }).default('10').notNull(),
  viewType: viewTypeEnum('view_type'),
  viewTypeOther: varchar('view_type_other', { length: 100 }), // custom view when viewType='other'
  // Minimum nights a guest must book
  minimumStay: integer('minimum_stay').notNull().default(1),
  // Badge label: 'best_seller' | 'guest_favorite' | 'new' | null
  propertyLabel: varchar('property_label', { length: 50 }),
  status: propertyStatusEnum('status').default('pending_review').notNull(),
  propertyIdDisplay: varchar('property_id_display', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertyImages = pgTable('property_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  isHero: boolean('is_hero').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const propertyFeatures = pgTable('property_features', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  featureName: varchar('feature_name', { length: 100 }).notNull(),
});

// Per-property mandatory extra fees (HK, cleaning, beach access, …).
// feeType: 'per_stay' (added once) | 'per_night' (× number of nights).
export const propertyFees = pgTable('property_fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  feeType: varchar('fee_type', { length: 20 }).notNull().default('per_stay'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: reviewStatusEnum('review_status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  numGuests: integer('num_guests').notNull().default(1),
  numRooms: integer('num_rooms').notNull().default(1),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPaid: boolean('deposit_paid').default(false).notNull(),
  remainingPaid: boolean('remaining_paid').default(false).notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  specialRequests: text('special_requests'),
  bookingDocs: jsonb('booking_docs').$type<BookingDoc[]>().default([]),
  hasFemaleGuest: boolean('has_female_guest').default(false).notNull(),
  docsStatus: varchar('docs_status', { length: 20 }).default('pending').notNull(),
  guestFirstName: varchar('guest_first_name', { length: 100 }),
  guestLastName: varchar('guest_last_name', { length: 100 }),
  guestEmail: varchar('guest_email', { length: 255 }),
  guestPhone: varchar('guest_phone', { length: 30 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export interface BookingDoc {
  type: 'national_id' | 'passport' | 'marriage_cert';
  owner: 'primary' | 'guest';
  label: string;
  url: string;
}

export const bookingAddons = pgTable('booking_addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  paymobTransactionId: varchar('paymob_transaction_id', { length: 255 }),
  method: paymentMethodEnum('method').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  locationPref: varchar('location_pref', { length: 100 }),
  purpose: varchar('purpose', { length: 100 }),
  guests: integer('guests'),
  roomsPref: varchar('rooms_pref', { length: 20 }),
  budgetRange: varchar('budget_range', { length: 50 }),
  durationPref: varchar('duration_pref', { length: 50 }),
  viewPref: varchar('view_pref', { length: 50 }),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const locationDiscounts = pgTable('location_discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  locationKeyword: varchar('location_keyword', { length: 255 }).notNull(),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).notNull(),
  label: varchar('label', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const websiteContent = pgTable('website_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  section: varchar('section', { length: 100 }).notNull().unique(),
  content: jsonb('content').$type<Record<string, any>>().notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
  questionnaireResponses: many(questionnaireResponses),
  reviews: many(reviews),
  passwordResetTokens: many(passwordResetTokens),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  images: many(propertyImages),
  features: many(propertyFeatures),
  fees: many(propertyFees),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const propertyFeesRelations = relations(propertyFees, ({ one }) => ({
  property: one(properties, { fields: [propertyFees.propertyId], references: [properties.id] }),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}));

export const propertyFeaturesRelations = relations(propertyFeatures, ({ one }) => ({
  property: one(properties, { fields: [propertyFeatures.propertyId], references: [properties.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, { fields: [reviews.propertyId], references: [properties.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  addons: many(bookingAddons),
  payment: one(payments),
}));

export const bookingAddonsRelations = relations(bookingAddons, ({ one }) => ({
  booking: one(bookings, { fields: [bookingAddons.bookingId], references: [bookings.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

export const questionnaireResponsesRelations = relations(questionnaireResponses, ({ one }) => ({
  user: one(users, { fields: [questionnaireResponses.userId], references: [users.id] }),
}));
