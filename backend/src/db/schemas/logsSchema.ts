import { pgTable, serial, date, doublePrecision, integer, text, varchar, timestamp, unique, primaryKey } from 'drizzle-orm/pg-core';
import { usersTable } from './userschema';
import { productsTable } from './productsSchema';


export const logsTable = pgTable('logs', {
    log_id: serial('log_id').primaryKey(),
    accessed_page_url: varchar('accessed_page_url', { length: 255 }).notNull(),
    operation_done: varchar('operation_done', { length: 255 }).notNull(),
    product_id: integer('product_id').references(() => productsTable.product_id, { onDelete: 'set null' }),
    user_id: integer('user_id').references(() => usersTable.user_id, { onDelete: 'cascade' }),
    log_timestamp: timestamp('log_timestamp').defaultNow(),
  });
  
  