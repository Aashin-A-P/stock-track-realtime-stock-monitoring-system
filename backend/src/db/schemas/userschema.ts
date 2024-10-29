import { pgTable, serial, varchar, timestamp,  } from 'drizzle-orm/pg-core';
export const usersTable = pgTable('users', {
    user_id: serial('user_id').primaryKey(),
    first_name: varchar('first_name', { length: 255 }).notNull(),
    last_name: varchar('last_name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    role: varchar('role', { length: 50 }).notNull().default('user'),
  });