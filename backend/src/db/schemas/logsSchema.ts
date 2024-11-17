import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const logsTable = pgTable('LogsTable', {
  logId: serial('log_id').primaryKey(),
  description: varchar('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
