import { Request, Response } from 'express';
import { db } from '../../db/index'; 
import { privilegesTable } from '../../db/schemas/privilegesSchema';
import { usersTable } from '../../db/schemas/usersSchema';
import { userPrivilegeTable } from '../../db/schemas/UserPrivilegesschema';
import { eq } from 'drizzle-orm';
export const addPrivilege = async (req: Request, res: Response) => {
  try {
    const { privilege } = req.body;

    if (!privilege) {
      res.status(400).send('Privilege is required');
      return;
    }
    // Insert privilege into the table
    const [newPrivilege] = await db
    .insert(privilegesTable)
    .values({ privilege })
    .returning();

    res.status(201).json({ message: 'Privilege added successfully', privilege: newPrivilege });
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      res.status(400).send('Privilege already exists');
    } else {
      console.error(error);
      res.status(500).send('Failed to add privilege');
    }
  }
};
export const addUserPrivilege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, privilegeId } = req.body;
    console.log('Request Body:', req.body);

    // Validate input
    if (!userId || !privilegeId) {
      res.status(400).json({ error: 'userId and privilegeId are required' });
      return;
    }

    // Check if the user exists
    const user = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    if (user.length === 0) {
      res.status(404).json({ error: `User with ID ${userId} not found` });
      return;
    }

    // Check if the privilege exists
    const privilege = await db.select().from(privilegesTable).where(eq(privilegesTable.privilegeId, privilegeId));
    if (privilege.length === 0) {
      res.status(404).json({ error: `Privilege with ID ${privilegeId} not found` });
      return;
    }

    // Add the user privilege
    const [userPrivilege] = await db
      .insert(userPrivilegeTable)
      .values({ userId, privilegeId })
      .returning();

    res.status(201).json({
      message: 'User privilege added successfully',
      data: userPrivilege,
    });
  } catch (error) {
    console.error('Error adding user privilege:', error);
    res.status(500).json({ error: 'Failed to add user privilege' });
  }
};