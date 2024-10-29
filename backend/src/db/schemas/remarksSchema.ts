import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const remarksTable = pgTable('RemarksTable', {
  remarkId: serial('remark_id').primaryKey(),
  remark: text('remark').notNull(),
});
