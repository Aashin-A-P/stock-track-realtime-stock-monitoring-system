import { pgTable, integer, varchar, text, decimal } from 'drizzle-orm/pg-core';
import { locationTable } from './locationsSchema';
import { statusTable } from './statusSchema';
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
  statusId: integer('status_id')
    .references(() => statusTable.statusId, { onDelete: 'set null', onUpdate: 'cascade' }),
  status: varchar('status_description').default('new'),
  gstAmount: decimal('GST_amount'),
  productImage: varchar('product_image'),
  productPrice: decimal('product_price').notNull(), 
  invoiceId: integer('invoice_id')
    .references(() => invoiceTable.invoiceId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  transferLetter: varchar('transfer_letter'),
  remarks:varchar('remarks'),
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
  statusId: true,
  remarks: true,
  // statusDescription:true,
  productImage: true, 
  transferLetter: true,
  gstAmount: true, 
  productId: true

}).extend({
  invoiceId: z.number(),
  categoryId: z.number(),
  productDescription: z.string().optional(),
  locationId: z.number().optional(),
  statusId: z.number().optional(),
  gstAmount: z.number().optional(),
  productImage: z.string().optional(),
  transferLetter: z.string().optional(), 
  productPrice: z.number().min(0),
  remarks: z.string().optional(),
  budgetId: z.number().optional(),
});