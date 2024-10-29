import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { usersTable } from './userschema';
import { privilegesTable } from './Privileges';
export const userPrivilegesTable = pgTable('user_privileges', {
    user_id: integer('user_id').notNull().references(() => usersTable.user_id, { onDelete: 'cascade' }),
    privilege_id: integer('privilege_id').notNull().references(() => privilegesTable.privilege_id, { onDelete: 'cascade' }),
  }, (table) => ({
    pk: primaryKey(usersTable.user_id, privilegesTable.privilege_id),
  }));
  
  