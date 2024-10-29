import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable('categories', {
    category_id: serial('category_id').primaryKey(),
    category_name: varchar('category_name', { length: 255 }).notNull(),
  });
  