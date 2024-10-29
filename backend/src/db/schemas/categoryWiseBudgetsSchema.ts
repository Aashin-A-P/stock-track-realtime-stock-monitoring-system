import { pgTable, integer, decimal } from 'drizzle-orm/pg-core';
import { budgetsTable } from './budgetsSchema';
import { categoriesTable } from './categoriesSchema';

export const categoryWiseBudgetsTable = pgTable('CategoryWiseBudgetsTable', {
  budgetId: integer('budget_id').references(() => budgetsTable.budgetId),
  categoryId: integer('category_id').references(() => categoriesTable.categoryId),
  amount: decimal('amount').notNull(),
}, (table) => ({
  primaryKey: [table.budgetId, table.categoryId],
}));
