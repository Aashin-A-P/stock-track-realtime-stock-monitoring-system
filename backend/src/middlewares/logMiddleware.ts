import { db } from '../db/index';
import { logsTable } from '../db/schemas/logsSchema';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const logger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.on('finish', async () => {
      const { logMessages } = req;
      const token = req.headers.authorization;

      if (logMessages && token) {

        // Decode the token to get userName
        const secretKey = process.env.SECRET_KEY!;
        const decodedToken = jwt.verify(token, secretKey) as { userName: string };
        const descriptions: {description: string}[] = [];

        logMessages.forEach((logMessage) => {
          descriptions.push({ description : `${logMessage} | Performed by: ${decodedToken.userName}` });
        })

        // Insert the log into the logs table
        await db.insert(logsTable).values(descriptions);
      }
    });
  } catch (error) {
    console.error('Failed to log operation:', error);
  }

  next();
};
