import { pgTable, integer, varchar, decimal, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const invoiceTable = pgTable('InvoiceTable', {
  invoiceId: integer('invoice_id').primaryKey().generatedAlwaysAsIdentity(),
  fromAddress: varchar('from_address').notNull(),
  toAddress: varchar('to_address').notNull(),
  actualAmount: decimal('actual_amount').notNull(),
  gstAmount: decimal('gst_amount').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  invoiceImage: varchar('invoice_image'),
});


export const createInvoiceSchema = createInsertSchema(invoiceTable)
  .omit({ invoiceId: true })
  .pick({ fromAddress: true, toAddress: true, actualAmount: true, gstAmount: true, invoiceDate: true, invoiceImage: true });