import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const locationTable = pgTable('LocationTable', {
  locationId: integer('location_id').primaryKey().generatedAlwaysAsIdentity(),
  locationName: varchar('location_name').unique(),
  staffIncharge: varchar('staff_incharge'),
});

export const createLocationSchema = createInsertSchema(locationTable)
  .omit({ locationId: true });