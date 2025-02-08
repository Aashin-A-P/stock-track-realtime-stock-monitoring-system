import { pgTable, integer, varchar, decimal, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';



export const invoiceTable = pgTable('InvoiceTable', {
  invoiceId: integer('invoice_id').primaryKey().generatedAlwaysAsIdentity(),
  invoiceNo: varchar('invoice_no').notNull().default("ABCDEFGH12345"),
  fromAddress: varchar('from_address').notNull(),
  toAddress: varchar('to_address').notNull(),
  totalAmount: decimal('total_amount').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  invoiceImage: varchar('invoice_image'),
  PODate: date('po_date').notNull().default('2025-02-06'), // Ensure this matches your database
});


// Schema for validation
export const createInvoiceSchema = createInsertSchema(invoiceTable)
  .omit({ invoiceId: true })
  .pick({
    invoiceNo: true,
    fromAddress: true,
    toAddress: true,
    totalAmount: true,
    invoiceDate: true,
    PODate: true,
    invoiceImage: true,
  })
