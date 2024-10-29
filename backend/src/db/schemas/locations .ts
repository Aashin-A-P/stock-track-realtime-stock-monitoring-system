import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm';

export const locationsTable = pgTable('locations', {
    location_id: serial('location_id').primaryKey(),
    location_name: varchar('location_name', { length: 255 }).notNull(),
  });
  