import { Request, Response } from 'express';
import { db } from '../../db/index'; 
import { privilegesTable } from '../../db/schemas/privilegesSchema';

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
