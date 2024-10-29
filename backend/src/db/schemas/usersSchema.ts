import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
export const usersTable = pgTable('UsersTable', {
  userId: serial('user_id').primaryKey(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  role: varchar('role').default('user'),
});

export const loginSchema = createInsertSchema(usersTable).pick({ email: true, password: true });

export const createUserSchema = createInsertSchema(usersTable).omit({ userId: true, createdAt: true, role: true });
