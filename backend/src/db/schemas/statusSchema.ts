import { pgTable, integer, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const statusTable = pgTable('StatusTable', { // Renamed table
  statusId: integer('status_id') // Renamed column
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  statusDescription: text('status_description') // Renamed column
    .notNull(),
});

export const createStatusSchema = createInsertSchema(statusTable) // Updated to use statusTable
  .pick({ statusDescription: true }); // Updated field name
