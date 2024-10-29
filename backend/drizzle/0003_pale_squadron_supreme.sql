ALTER TABLE "budgets" RENAME COLUMN "id" TO "budget_id";--> statement-breakpoint
ALTER TABLE "category_wise_budgets" DROP CONSTRAINT "category_wise_budgets_budget_id_budgets_id_fk";
--> statement-breakpoint
ALTER TABLE "category_wise_budgets" DROP CONSTRAINT "category_wise_budgets_id_category_id_pk";--> statement-breakpoint
ALTER TABLE "category_wise_budgets" ADD CONSTRAINT "category_wise_budgets_budget_id_category_id_pk" PRIMARY KEY("budget_id","category_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_wise_budgets" ADD CONSTRAINT "category_wise_budgets_budget_id_budgets_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("budget_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
