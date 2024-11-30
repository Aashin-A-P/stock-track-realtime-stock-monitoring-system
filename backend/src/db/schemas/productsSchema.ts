import { pgTable, integer, varchar, text, decimal } from 'drizzle-orm/pg-core';
import { locationTable } from './locationsSchema';
import { remarksTable } from './remarksSchema';
import { invoiceTable } from './invoicesSchema';
import { categoriesTable } from './categoriesSchema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const productsTable = pgTable('ProductsTable', {
  productId: integer('product_id').primaryKey().generatedAlwaysAsIdentity(),
  productVolPageSerial: varchar('product_vol_page_serial').notNull(),
  productName: varchar('product_name').notNull(),
  productDescription: text('product_description'),
  locationId: integer('location_id')
    .references(() => locationTable.locationId, { onDelete: 'set null', onUpdate: 'cascade' }),
  remarkId: integer('remark_id')
    .references(() => remarksTable.remarkId, { onDelete: 'set null', onUpdate: 'cascade' }),
  gst: decimal('GST'),
  productImage: varchar('product_image'),
  invoiceId: integer('invoice_id')
    .references(() => invoiceTable.invoiceId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  categoryId: integer('category_id')
    .references(() => categoriesTable.categoryId, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const createProductSchema = createInsertSchema(productsTable).pick({
  productVolPageSerial: true, // Required field
  productName: true,          // Required field
  invoiceId: true,
  categoryId: true,
  productDescription: true,
  locationId: true, 
  remarkId: true,
  productImage: true, 
  gst: true, 
}).extend({
  invoiceId: z.number(),
  categoryId: z.number(),
  productDescription: z.string().optional(),
  locationId: z.number().optional(),
  remarkId: z.number().optional(),
  gst: z.number().optional(),
  productImage: z.string().optional(),
});