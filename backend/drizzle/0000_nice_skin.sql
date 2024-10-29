CREATE TABLE IF NOT EXISTS "BudgetsTable" (
	"budget_id" serial PRIMARY KEY NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoriesTable" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar NOT NULL,
	CONSTRAINT "CategoriesTable_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoryWiseBudgetsTable" (
	"budget_id" integer,
	"category_id" integer,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InvoiceTable" (
	"invoice_id" serial PRIMARY KEY NOT NULL,
	"from_address" varchar NOT NULL,
	"to_address" varchar NOT NULL,
	"actual_amount" numeric NOT NULL,
	"gst_amount" numeric NOT NULL,
	"invoice_date" date NOT NULL,
	"invoice_image" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LocationTable" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"location_name" varchar NOT NULL,
	CONSTRAINT "LocationTable_location_name_unique" UNIQUE("location_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LogsTable" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"accessed_page_url" varchar NOT NULL,
	"operation_done" varchar NOT NULL,
	"product_id" integer,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrivilegesTable" (
	"privilege_id" serial PRIMARY KEY NOT NULL,
	"privilege" varchar NOT NULL,
	CONSTRAINT "PrivilegesTable_privilege_unique" UNIQUE("privilege")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductsTable" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar NOT NULL,
	"product_description" text,
	"location_id" integer,
	"remark_id" integer,
	"GST" numeric,
	"product_image" varchar,
	"invoice_id" integer,
	"category_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RemarksTable" (
	"remark_id" serial PRIMARY KEY NOT NULL,
	"remark" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPrivilegeTable" (
	"user_id" integer,
	"privilege_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UsersTable" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role" varchar DEFAULT 'user',
	CONSTRAINT "UsersTable_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_budget_id_BudgetsTable_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."BudgetsTable"("budget_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "LogsTable" ADD CONSTRAINT "LogsTable_product_id_ProductsTable_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."ProductsTable"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "LogsTable" ADD CONSTRAINT "LogsTable_user_id_UsersTable_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."UsersTable"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_location_id_LocationTable_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."LocationTable"("location_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_remark_id_RemarksTable_remark_id_fk" FOREIGN KEY ("remark_id") REFERENCES "public"."RemarksTable"("remark_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_invoice_id_InvoiceTable_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."InvoiceTable"("invoice_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_user_id_UsersTable_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."UsersTable"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_privilege_id_PrivilegesTable_privilege_id_fk" FOREIGN KEY ("privilege_id") REFERENCES "public"."PrivilegesTable"("privilege_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
