import { pgTable, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { budgetsTable } from './budgetsSchema';
import { categoriesTable } from './categoriesSchema';

export const categoryWiseBudgetsTable = pgTable('CategoryWiseBudgetsTable', {
  categoryWiseBudgetId: integer('category_wise_budget_id').primaryKey().generatedAlwaysAsIdentity(),
  budgetId: integer('budget_id')
    .notNull()
    .references(() => budgetsTable.budgetId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categoriesTable.categoryId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  amount: decimal('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
