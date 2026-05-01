CREATE TYPE "public"."application_source" AS ENUM('linkedin', 'referral', 'direct', 'job_board', 'recruiter', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"source" "application_source",
	"job_url" text,
	"salary" text,
	"location" text,
	"notes" text,
	"next_step_at" timestamp,
	"next_step_label" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_user_status_idx" ON "applications" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "applications_user_applied_idx" ON "applications" USING btree ("user_id","applied_at");--> statement-breakpoint
CREATE INDEX "reminders_scheduled_idx" ON "reminders" USING btree ("scheduled_for");