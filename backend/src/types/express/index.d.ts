import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      cleanBody?: any;
      role: string;
    }
  }
}

export {};
