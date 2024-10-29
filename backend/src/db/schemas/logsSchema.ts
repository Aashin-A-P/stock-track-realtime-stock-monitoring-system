import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { productsTable } from './productsSchema';
import { usersTable } from './usersSchema';

export const logsTable = pgTable('LogsTable', {
  logId: serial('log_id').primaryKey(),
  accessedPageUrl: varchar('accessed_page_url').notNull(),
  operationDone: varchar('operation_done').notNull(),
  productId: integer('product_id').references(() => productsTable.productId),
  userId: integer('user_id').references(() => usersTable.userId),
});
