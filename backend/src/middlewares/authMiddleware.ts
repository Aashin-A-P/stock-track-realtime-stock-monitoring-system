import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('authorization');

  if (!token) {
    res.status(401).json({ error: 'Access denied' });
    return
  }

  try {
    // decode jwt token data
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);

    if (typeof decoded !== 'object' || !decoded?.userId) {

      res.status(401).json({ error: 'Access denied' });

      return;
    }
    
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.privileges = decoded.privileges || [];

    next();
  } catch (e) {

    res.status(401).json({ error: 'Access denied' });
  }
}

export function UserOrAdminOnlyAccess(req: Request, res: Response, next: NextFunction) {
  const role = req.role;
  if (role !== 'user' && role !== 'admin') {

    res.status(401).json({ error: 'Access denied' });
    return;
  }

  next();
}

export function AdminOnlyAccess(req: Request, res: Response, next: NextFunction) {
  const role = req.role;
  if (role !== 'admin') {
    res.status(401).json({ error: 'Access denied' });
    return;
  }
  next();
}
