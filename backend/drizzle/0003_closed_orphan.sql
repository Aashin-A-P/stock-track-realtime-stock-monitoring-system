ALTER TABLE "LogsTable" RENAME COLUMN "accessed_page_url" TO "description";--> statement-breakpoint
ALTER TABLE "LogsTable" DROP CONSTRAINT "LogsTable_product_id_ProductsTable_product_id_fk";
--> statement-breakpoint
ALTER TABLE "LogsTable" DROP CONSTRAINT "LogsTable_user_id_UsersTable_user_id_fk";
--> statement-breakpoint
ALTER TABLE "LocationTable" ALTER COLUMN "location_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ProductsTable" ALTER COLUMN "product_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "LogsTable" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "LogsTable" DROP COLUMN IF EXISTS "operation_done";--> statement-breakpoint
ALTER TABLE "LogsTable" DROP COLUMN IF EXISTS "product_id";--> statement-breakpoint
ALTER TABLE "LogsTable" DROP COLUMN IF EXISTS "user_id";