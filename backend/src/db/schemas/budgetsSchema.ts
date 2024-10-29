import { pgTable, serial, date, decimal } from 'drizzle-orm/pg-core';

export const budgetsTable = pgTable('BudgetsTable', {
  budgetId: serial('budget_id').primaryKey(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  amount: decimal('amount').notNull(),
});
