import { pgTable, integer, text } from 'drizzle-orm/pg-core';

export const remarksTable = pgTable('RemarksTable', {
  remarkId: integer('remark_id').primaryKey().generatedAlwaysAsIdentity(),
  remark: text('remark').notNull(),
});
