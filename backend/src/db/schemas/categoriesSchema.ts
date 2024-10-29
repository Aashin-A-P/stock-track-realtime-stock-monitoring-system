import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable('CategoriesTable', {
  categoryId: serial('category_id').primaryKey(),
  categoryName: varchar('category_name').notNull().unique(),
});
