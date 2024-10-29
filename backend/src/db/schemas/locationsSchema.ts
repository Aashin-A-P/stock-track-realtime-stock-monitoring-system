import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const locationTable = pgTable('LocationTable', {
  locationId: serial('location_id').primaryKey(),
  locationName: varchar('location_name').notNull().unique(),
});
