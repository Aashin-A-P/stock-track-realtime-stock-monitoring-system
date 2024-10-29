import { pgTable, serial, varchar, decimal, date } from 'drizzle-orm/pg-core';

export const invoiceTable = pgTable('InvoiceTable', {
  invoiceId: serial('invoice_id').primaryKey(),
  fromAddress: varchar('from_address').notNull(),
  toAddress: varchar('to_address').notNull(),
  actualAmount: decimal('actual_amount').notNull(),
  gstAmount: decimal('gst_amount').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  invoiceImage: varchar('invoice_image'),
});
