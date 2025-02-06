ALTER TABLE "RemarksTable" RENAME TO "StatusTable";--> statement-breakpoint
ALTER TABLE "ProductsTable" RENAME COLUMN "remark_id" TO "status_id";--> statement-breakpoint
ALTER TABLE "StatusTable" RENAME COLUMN "remark_id" TO "status_id";--> statement-breakpoint
ALTER TABLE "StatusTable" RENAME COLUMN "remark" TO "status_description";--> statement-breakpoint
ALTER TABLE "ProductsTable" DROP CONSTRAINT "ProductsTable_remark_id_RemarksTable_remark_id_fk";
--> statement-breakpoint
ALTER TABLE "ProductsTable" ADD COLUMN "status_description" varchar DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "ProductsTable" ADD COLUMN "transfer_letter" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_status_id_StatusTable_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."StatusTable"("status_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
