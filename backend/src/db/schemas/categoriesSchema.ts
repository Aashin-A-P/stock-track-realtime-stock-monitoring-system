import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable('CategoriesTable', {
  categoryId: integer('category_id').primaryKey().generatedAlwaysAsIdentity(),
  categoryName: varchar('category_name').notNull().unique(),
});
