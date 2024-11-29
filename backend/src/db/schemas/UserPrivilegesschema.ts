import { pgTable, integer } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';
import { privilegesTable } from './privilegesSchema';

export const userPrivilegeTable = pgTable('UserPrivilegeTable', {
  userPrivilegeId: integer('user_privilege_id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.userId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  privilegeId: integer('privilege_id')
    .notNull()
    .references(() => privilegesTable.privilegeId, { onDelete: 'cascade', onUpdate: 'cascade' }),
});
