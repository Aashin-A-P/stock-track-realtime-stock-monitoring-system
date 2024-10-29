import { pgTable, serial, varchar, text, integer, decimal } from 'drizzle-orm/pg-core';
import { locationTable } from './locationsSchema';
import { remarksTable } from './remarksSchema';
import { invoiceTable } from './invoicesSchema';
import { categoriesTable } from './categoriesSchema';

export const productsTable = pgTable('ProductsTable', {
  productId: serial('product_id').primaryKey(),
  productName: varchar('product_name').notNull(),
  productDescription: text('product_description'),
  locationId: integer('location_id').references(() => locationTable.locationId),
  remarkId: integer('remark_id').references(() => remarksTable.remarkId),
  gst: decimal('GST'),
  productImage: varchar('product_image'),
  invoiceId: integer('invoice_id').references(() => invoiceTable.invoiceId),
  categoryId: integer('category_id').references(() => categoriesTable.categoryId),
});
