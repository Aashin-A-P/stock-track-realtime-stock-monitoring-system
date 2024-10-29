import { pgTable, serial, date, doublePrecision, text} from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm';


export const invoicesTable = pgTable('invoices', {
    invoice_id: serial('invoice_id').primaryKey(),
    from_address: text('from_address').notNull(),
    to_address: text('to_address').notNull(),
    actual_amount: doublePrecision('actual_amount').notNull(),
    gst_amount: doublePrecision('gst_amount').notNull(),
    invoice_date: date('invoice_date').notNull(),
    invoice_image: text('invoice_image'),  // Storing image as a URL or path for simplicity
  });
  