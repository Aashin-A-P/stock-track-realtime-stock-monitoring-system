import { pgTable, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const logsTable = pgTable('LogsTable', {
  logId: integer('log_id').primaryKey().generatedAlwaysAsIdentity(),
  description: varchar('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
