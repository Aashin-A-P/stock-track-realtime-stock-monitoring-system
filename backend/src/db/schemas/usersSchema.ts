import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
export const usersTable = pgTable('UsersTable', {
  userId: serial('user_id').primaryKey(),
  userName: varchar('user_name').notNull().unique(),
  password: varchar('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  role: varchar('role').default('user'),
});

export const loginSchema = createInsertSchema(usersTable).pick({ userName: true, password: true });

export const createUserSchema = createInsertSchema(usersTable).omit({ userId: true, createdAt: true, role: true });
