import { date,integer, pgTable } from "drizzle-orm/pg-core";

export const budgetsTable = pgTable("budgets", {
  budget_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  amount: integer("amount").notNull(),
});