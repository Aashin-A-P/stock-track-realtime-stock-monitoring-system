import { pgTable, integer, date, decimal, varchar } from 'drizzle-orm/pg-core';

export const budgetsTable = pgTable('BudgetsTable', {
  budgetId: integer('budget_id').primaryKey().generatedAlwaysAsIdentity(),
  budgetName: varchar('budget_name').notNull().default('New Budget'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  amount: decimal('amount').notNull(),
});
