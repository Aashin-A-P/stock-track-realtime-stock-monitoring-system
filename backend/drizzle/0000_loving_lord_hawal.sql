CREATE TABLE IF NOT EXISTS "BudgetsTable" (
	"budget_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "BudgetsTable_budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoriesTable" (
	"category_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "CategoriesTable_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_name" varchar NOT NULL,
	CONSTRAINT "CategoriesTable_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoryWiseBudgetsTable" (
	"category_wise_budget_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "CategoryWiseBudgetsTable_category_wise_budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"budget_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InvoiceTable" (
	"invoice_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "InvoiceTable_invoice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invoice_no" varchar DEFAULT 'ABCDEFGH12345' NOT NULL,
	"from_address" varchar NOT NULL,
	"to_address" varchar NOT NULL,
	"total_amount" numeric NOT NULL,
	"invoice_date" date NOT NULL,
	"invoice_image" varchar,
	"po_date" date DEFAULT '2025-02-06' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LocationTable" (
	"location_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "LocationTable_location_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"location_name" varchar,
	CONSTRAINT "LocationTable_location_name_unique" UNIQUE("location_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LogsTable" (
	"log_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "LogsTable_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"description" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrivilegesTable" (
	"privilege_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "PrivilegesTable_privilege_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"privilege" varchar NOT NULL,
	CONSTRAINT "PrivilegesTable_privilege_unique" UNIQUE("privilege")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductsTable" (
	"product_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ProductsTable_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_vol_page_serial" varchar NOT NULL,
	"product_name" varchar NOT NULL,
	"product_description" text,
	"location_id" integer,
	"status_id" integer,
	"status_description" varchar DEFAULT 'new',
	"GST_amount" numeric,
	"product_image" varchar,
	"product_price" integer DEFAULT 0 NOT NULL,
	"invoice_id" integer,
	"transfer_letter" varchar,
	"remarks" varchar,
	"category_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StatusTable" (
	"status_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "StatusTable_status_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPrivilegeTable" (
	"user_privilege_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "UserPrivilegeTable_user_privilege_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"privilege_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UsersTable" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "UsersTable_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role" varchar DEFAULT 'user',
	CONSTRAINT "UsersTable_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_budget_id_BudgetsTable_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."BudgetsTable"("budget_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_location_id_LocationTable_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."LocationTable"("location_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_status_id_StatusTable_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."StatusTable"("status_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_invoice_id_InvoiceTable_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."InvoiceTable"("invoice_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_user_id_UsersTable_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."UsersTable"("user_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_privilege_id_PrivilegesTable_privilege_id_fk" FOREIGN KEY ("privilege_id") REFERENCES "public"."PrivilegesTable"("privilege_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
