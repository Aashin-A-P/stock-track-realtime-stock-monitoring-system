import { pgTable, serial, text } from 'drizzle-orm/pg-core';


export const remarksTable = pgTable('remarks', {
    remark_id: serial('remark_id').primaryKey(),
    remark: text('remark').notNull(),
  });
  