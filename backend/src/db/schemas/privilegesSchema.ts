import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import {createInsertSchema} from 'drizzle-zod'
export const privilegesTable = pgTable('PrivilegesTable', {
  privilegeId: serial('privilege_id').primaryKey(),
  privilege: varchar('privilege').notNull().unique(),
});
export const createPrivilegeSchema = createInsertSchema(privilegesTable).omit({ privilegeId: true });
