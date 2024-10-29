import { pgTable, serial,  doublePrecision, integer, text, varchar} from 'drizzle-orm/pg-core';
import { locationsTable } from './locations ';
import { remarksTable } from './remarksSchema';
import { invoicesTable } from './invoiceSchema';
import { categoriesTable } from './categoriesSchema';


export const productsTable = pgTable('products', {
    product_id: serial('product_id').primaryKey(),
    product_name: varchar('product_name', { length: 255 }).notNull(),
    product_description: text('product_description'),
    location_id: integer('location_id').references(() => locationsTable.location_id, { onDelete: 'set null' }),
    remark_id: integer('remark_id').references(() => remarksTable.remark_id, { onDelete: 'set null' }),
    GST: doublePrecision('GST'),
    product_image: text('product_image'),  // Storing image as a URL or path
    invoice_id: integer('invoice_id').references(() => invoicesTable.invoice_id, { onDelete: 'set null' }),
    category_id: integer('category_id').references(() => categoriesTable.category_id, { onDelete: 'set null' }),
  });
  