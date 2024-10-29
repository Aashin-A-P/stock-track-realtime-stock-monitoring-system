import { pgTable, serial,varchar } from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm';
export const privilegesTable = pgTable('privileges', {
    privilege_id: serial('privilege_id').primaryKey(),
    privilege: varchar('privilege', { length: 255 }).notNull(),
  });
  