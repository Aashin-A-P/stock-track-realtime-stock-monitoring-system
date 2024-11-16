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
      data.password = await bcrypt.hash(data.password, 10);
  
      const [user] = await db.insert(usersTable).values(data).returning();
  
      // @ts-ignore
      delete user.password;
      const token = generateUserToken(user);
  
      res.status(201).json({ user, token });
    } catch (e) {
      console.log(e);
      res.status(500).send('Something went wrong');
    }
};

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
  
      // create a jwt token
      const token = generateUserToken(user);
      // @ts-ignore
      delete user.password;
      res.status(200).json({ token, user });
    } catch (e) {
      res.status(500).send('Something went wrong');
    }
};
