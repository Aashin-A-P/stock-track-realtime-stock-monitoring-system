import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const locationTable = pgTable('LocationTable', {
  locationId: integer('location_id').primaryKey().generatedAlwaysAsIdentity(),
  locationName: varchar('location_name').unique(),
});
