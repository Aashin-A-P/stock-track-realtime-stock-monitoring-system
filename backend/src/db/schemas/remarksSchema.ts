import { pgTable, integer, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const remarksTable = pgTable('RemarksTable', {
  remarkId: integer('remark_id').primaryKey().generatedAlwaysAsIdentity(),
  remark: text('remark').notNull(),
});

export const createRemarkSchema = createInsertSchema(remarksTable)
  .pick({ remark: true });