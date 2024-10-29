import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const privilegesTable = pgTable('PrivilegesTable', {
  privilegeId: serial('privilege_id').primaryKey(),
  privilege: varchar('privilege').notNull().unique(),
});
