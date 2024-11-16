import { Request, Response } from 'express';
import { usersTable } from '../../db/schemas/usersSchema';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const generateUserToken = (user: any) => {
    const secretKey : string = process.env.SECRET_KEY!;
    return jwt.sign({ userId: user.userId, role: user.role }, secretKey, {
        expiresIn: '30d',
    });
};
export const registerUser = async (req: Request, res: Response) => {
    try {
      const data = req.cleanBody;
      console.log(data);
      data.password = await bcrypt.hash(data.password, 10);
  
      const [user] = await db.insert(usersTable).values(data).returning();
      console.log(user);

      // @ts-ignore
      delete user.password;
      const token = generateUserToken(user);
  
      res.status(201).json({ user, token });
    } catch (e) {
      console.log(e);
      res.status(500).send('Something went wrong');
    }
};
