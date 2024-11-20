import { pgTable, integer, date, decimal } from 'drizzle-orm/pg-core';

export const budgetsTable = pgTable('BudgetsTable', {
  budgetId: integer('budget_id').primaryKey().generatedAlwaysAsIdentity(),  // id: integer('id').primaryKey().autoIncrement(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  amount: decimal('amount').notNull(),
});
