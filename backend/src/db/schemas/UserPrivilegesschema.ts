import { pgTable, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';
import { privilegesTable } from './privilegesSchema';
import { z } from 'zod';

export const userPrivilegeTable = pgTable('UserPrivilegeTable', {
  userPrivilegeId: integer('user_privilege_id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.userId, { onDelete: 'cascade', onUpdate: 'cascade' }),
  privilegeId: integer('privilege_id')
    .notNull()
    .references(() => privilegesTable.privilegeId, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const addUserPrivilegeSchema = z.object({
  userId: z.number().int().positive(),
  privilege: z.string().nonempty(),
});