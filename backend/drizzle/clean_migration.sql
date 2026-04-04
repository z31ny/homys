CREATE TYPE "public"."age_range" AS ENUM('18-25', '26-35', '36-50', '50+');
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'upcoming', 'completed', 'cancelled');
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');
CREATE TYPE "public"."payment_method" AS ENUM('card', 'paymob');
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'refunded');
CREATE TYPE "public"."property_status" AS ENUM('pending_review', 'approved', 'rejected', 'archived');
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'villa', 'chalet', 'studio');
CREATE TYPE "public"."view_type" AS ENUM('sea', 'pool', 'garden', 'city');
CREATE TABLE "booking_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL
);

CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"property_id" uuid,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"num_guests" integer DEFAULT 1 NOT NULL,
	"num_rooms" integer DEFAULT 1 NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) DEFAULT '0',
	"total_price" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"special_requests" text,
	"guest_first_name" varchar(100),
	"guest_last_name" varchar(100),
	"guest_email" varchar(255),
	"guest_phone" varchar(30),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"paymob_transaction_id" varchar(255),
	"method" "payment_method" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"project_name" varchar(255),
	"title" varchar(255) NOT NULL,
	"property_type" "property_type" NOT NULL,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"bathrooms" integer DEFAULT 1 NOT NULL,
	"sqft" integer,
	"price_per_night" numeric(10, 2) NOT NULL,
	"is_furnished" boolean DEFAULT false,
	"description" text,
	"location_name" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"nearby_essentials" jsonb DEFAULT '[]'::jsonb,
	"max_guests" integer DEFAULT 2,
	"bed_type" varchar(100),
	"view_type" "view_type",
	"climate_info" varchar(255),
	"status" "property_status" DEFAULT 'pending_review' NOT NULL,
	"property_id_display" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "property_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"feature_name" varchar(100) NOT NULL
);

CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"is_hero" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"location_pref" varchar(100),
	"purpose" varchar(100),
	"guests" integer,
	"rooms_pref" varchar(20),
	"budget_range" varchar(50),
	"duration_pref" varchar(50),
	"view_pref" varchar(50),
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(30),
	"gender" "gender",
	"age_range" "age_range",
	"country" varchar(100),
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
