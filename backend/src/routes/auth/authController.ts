import { Request, Response } from 'express';
import { usersTable } from '../../db/schemas/usersSchema';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { userPrivilegeTable } from '../../db/schemas/UserPrivilegesschema';
import { privilegesTable } from '../../db/schemas/privilegesSchema';
import { generateUserToken } from '../../../utils';

export const loginUser = async (req: Request, res: Response) => {
    try {
      const { userName, password } = req.cleanBody;
  
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userName, userName ));
      if (!user) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }
  
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }

      // get user privileges
      const privileges = await db
      .select({
          privilege: privilegesTable.privilege,
      })
      .from(userPrivilegeTable)
      .innerJoin(usersTable, eq(userPrivilegeTable.userId, usersTable.userId))
      .innerJoin(privilegesTable, eq(userPrivilegeTable.privilegeId, privilegesTable.privilegeId))
      .where(eq(usersTable.userName, user.userName));

      const AllPrivileges : String[] = privileges.map((p: {privilege : String}) => p.privilege);
  
      // Generate token with user privileges
    const token = generateUserToken({
      user,
      privileges: AllPrivileges,
    });

      // @ts-ignore
      delete user.password;
      res.status(200).json({ token, user });
    } catch (e) {
      res.status(500).send('Something went wrong');
    }
};
