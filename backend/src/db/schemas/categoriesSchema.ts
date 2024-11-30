import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const categoriesTable = pgTable('CategoriesTable', {
  categoryId: integer('category_id').primaryKey().generatedAlwaysAsIdentity(),
  categoryName: varchar('category_name').notNull().unique(),
});

export const createCategorySchema = createInsertSchema(categoriesTable)
  .pick({ categoryName: true });