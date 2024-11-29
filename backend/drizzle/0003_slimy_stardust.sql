ALTER TABLE "CategoryWiseBudgetsTable" DROP CONSTRAINT "CategoryWiseBudgetsTable_budget_id_BudgetsTable_budget_id_fk";
--> statement-breakpoint
ALTER TABLE "CategoryWiseBudgetsTable" DROP CONSTRAINT "CategoryWiseBudgetsTable_category_id_CategoriesTable_category_id_fk";
--> statement-breakpoint
ALTER TABLE "ProductsTable" DROP CONSTRAINT "ProductsTable_location_id_LocationTable_location_id_fk";
--> statement-breakpoint
ALTER TABLE "ProductsTable" DROP CONSTRAINT "ProductsTable_remark_id_RemarksTable_remark_id_fk";
--> statement-breakpoint
ALTER TABLE "ProductsTable" DROP CONSTRAINT "ProductsTable_invoice_id_InvoiceTable_invoice_id_fk";
--> statement-breakpoint
ALTER TABLE "ProductsTable" DROP CONSTRAINT "ProductsTable_category_id_CategoriesTable_category_id_fk";
--> statement-breakpoint
ALTER TABLE "UserPrivilegeTable" DROP CONSTRAINT "UserPrivilegeTable_user_id_UsersTable_user_id_fk";
--> statement-breakpoint
ALTER TABLE "UserPrivilegeTable" DROP CONSTRAINT "UserPrivilegeTable_privilege_id_PrivilegesTable_privilege_id_fk";
--> statement-breakpoint
ALTER TABLE "CategoryWiseBudgetsTable" ALTER COLUMN "category_wise_budget_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "CategoryWiseBudgetsTable_category_wise_budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "UserPrivilegeTable" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPrivilegeTable" ALTER COLUMN "privilege_id" SET NOT NULL;--> statement-breakpoint
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
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_remark_id_RemarksTable_remark_id_fk" FOREIGN KEY ("remark_id") REFERENCES "public"."RemarksTable"("remark_id") ON DELETE set null ON UPDATE cascade;
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
