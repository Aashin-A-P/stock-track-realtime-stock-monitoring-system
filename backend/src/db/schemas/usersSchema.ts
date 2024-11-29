import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const usersTable = pgTable('UsersTable', {
  userId: integer('user_id').primaryKey().generatedAlwaysAsIdentity(),
  userName: varchar('user_name').notNull().unique(),
  password: varchar('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  role: varchar('role').default('user'),
});

export const loginSchema = createInsertSchema(usersTable).pick({ userName: true, password: true });

export const createUserSchema = createInsertSchema(usersTable)
  .omit({ userId: true, createdAt: true, role: true })
  .extend({
    privileges: z.array(z.string()),
  });

export const deleteUserSchema = createInsertSchema(usersTable).pick({ userId: true });
