import { pgTable, integer } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';
import { privilegesTable } from './privilegesSchema';

export const userPrivilegeTable = pgTable('UserPrivilegeTable', {
  userPrivilegeId: integer('user_privilege_id').primaryKey(),
  userId: integer('user_id').references(() => usersTable.userId),
  privilegeId: integer('privilege_id').references(() => privilegesTable.privilegeId),
});
