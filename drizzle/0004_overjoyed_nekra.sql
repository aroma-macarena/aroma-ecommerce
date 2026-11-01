ALTER TABLE "profiles" ALTER COLUMN "auth_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "invitation_id" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_profiles_email_lower" ON "profiles" USING btree (lower("email"));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_invitation_id_unique" UNIQUE("invitation_id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "ck_super_admin_without_association" CHECK ("profiles"."role" <> 'SUPER_ADMIN' OR "profiles"."association_id" IS NULL);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "ck_profile_linked_or_invited" CHECK (("profiles"."auth_user_id" IS NULL) <> ("profiles"."invitation_id" IS NULL));