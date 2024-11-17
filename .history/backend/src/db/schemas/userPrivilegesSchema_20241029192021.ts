import { pgTable, integer } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';
import { privilegesTable } from './privilegesSchema';

export const userPrivilegeTable = pgTable('UserPrivilegeTable', {
  userId: integer('user_id').references(() => usersTable.userId),
  privilegeId: integer('privilege_id').references(() => privilegesTable.privilegeId),
}, (table) => ({
  primaryKey: [table.userId, table.privilegeId],
}));
