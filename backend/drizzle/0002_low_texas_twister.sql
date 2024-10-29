CREATE TABLE IF NOT EXISTS "category_wise_budgets" (
	"budget_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	CONSTRAINT "category_wise_budgets_id_category_id_pk" PRIMARY KEY("budget_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"invoice_id" serial PRIMARY KEY NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"actual_amount" double precision NOT NULL,
	"gst_amount" double precision NOT NULL,
	"invoice_date" date NOT NULL,
	"invoice_image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"location_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "privileges" (
	"privilege_id" serial PRIMARY KEY NOT NULL,
	"privilege" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "remarks" (
	"remark_id" serial PRIMARY KEY NOT NULL,
	"remark" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_privileges" (
	"user_id" integer NOT NULL,
	"privilege_id" integer NOT NULL,
	CONSTRAINT "user_privileges_user_id_privilege_id_pk" PRIMARY KEY("user_id","privilege_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_wise_budgets" ADD CONSTRAINT "category_wise_budgets_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_wise_budgets" ADD CONSTRAINT "category_wise_budgets_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_privileges" ADD CONSTRAINT "user_privileges_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_privileges" ADD CONSTRAINT "user_privileges_privilege_id_privileges_privilege_id_fk" FOREIGN KEY ("privilege_id") REFERENCES "public"."privileges"("privilege_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
