CREATE TABLE "association_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"association_id" uuid NOT NULL,
	"object_key" varchar(500) NOT NULL,
	"alt_text" varchar(300),
	"caption" varchar(160),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "ck_association_photos_display_order_non_negative" CHECK ("association_photos"."display_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "association_photos" ADD CONSTRAINT "association_photos_association_id_associations_id_fk" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_association_photos_association_id" ON "association_photos" USING btree ("association_id");