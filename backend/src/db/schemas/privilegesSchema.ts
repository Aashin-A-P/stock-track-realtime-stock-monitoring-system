import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const privilegesTable = pgTable('PrivilegesTable', {
  privilegeId: integer('privilege_id').primaryKey().generatedAlwaysAsIdentity(),
  privilege: varchar('privilege').unique().notNull(),
});

export const createPrivilegeSchema = createInsertSchema(privilegesTable).omit({ privilegeId: true });
