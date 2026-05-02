DROP INDEX "checklist_application_idx";--> statement-breakpoint
CREATE INDEX "applications_user_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checklist_app_pos_idx" ON "checklist_items" USING btree ("application_id","position");--> statement-breakpoint
CREATE INDEX "reminders_unsent_idx" ON "reminders" USING btree ("application_id","sent_at");