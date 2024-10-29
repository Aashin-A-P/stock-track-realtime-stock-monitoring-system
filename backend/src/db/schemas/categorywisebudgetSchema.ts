import { pgTable, serial, date, doublePrecision, integer, primaryKey } from 'drizzle-orm/pg-core';
import { budgetsTable } from './budgetsSchema';
import { categoriesTable } from './categoriesSchema';

export const categoryWiseBudgetsTable = pgTable('category_wise_budgets', {
    budget_id: integer('budget_id').notNull().references(() => budgetsTable.budget_id, { onDelete: 'cascade' }),
    category_id: integer('category_id').notNull().references(() => categoriesTable.category_id, { onDelete: 'cascade' }),
    amount: doublePrecision('amount').notNull(),
  }, (table) => ({
    pk: primaryKey({ columns: [table.budget_id, table.category_id] }),
  }))