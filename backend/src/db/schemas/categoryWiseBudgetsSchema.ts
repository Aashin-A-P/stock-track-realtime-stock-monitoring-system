import { pgTable, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { budgetsTable } from './budgetsSchema';
import { categoriesTable } from './categoriesSchema';

export const categoryWiseBudgetsTable = pgTable('CategoryWiseBudgetsTable', {
  categoryWiseBudgetId: integer('category_wise_budget_id').primaryKey(),
  budgetId: integer('budget_id').references(() => budgetsTable.budgetId),
  categoryId: integer('category_id').references(() => categoriesTable.categoryId),
  amount: decimal('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
