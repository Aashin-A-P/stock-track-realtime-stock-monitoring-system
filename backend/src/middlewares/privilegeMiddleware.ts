import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { userPrivilegeTable } from "../db/schemas/UserPrivilegesschema";
import { privilegesTable } from "../db/schemas/privilegesSchema";
import { eq } from 'drizzle-orm';

// Updated middleware with correct return types
export async function loadUserPrivileges(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {  // Explicit return type
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;  // Just return, don't return the Response object
    }

    const privileges = await db
      .select({ name: privilegesTable.privilege })
      .from(userPrivilegeTable)
      .innerJoin(privilegesTable, eq(userPrivilegeTable.privilegeId, privilegesTable.privilegeId))
      .where(eq(userPrivilegeTable.userId, req.userId));

    req.privileges = privileges.map(p => p.name);
    next();  // Call next() instead of returning
  } catch (error) {
    console.error('Error loading user privileges:', error);
    res.status(500).json({ error: 'Failed to load user privileges' });
    // No return needed here either
  }
}

// Updated privilege check middleware
export function hasPrivilege(requiredPrivilege: string) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction
  ): void {  // Explicit return type
    if (!req.privileges?.includes(requiredPrivilege)) {
      res.status(403).json({ 
        success: false,
        error: `Access denied. Required privilege: ${requiredPrivilege}` 
      });
      return;  // Just return, not returning the Response
    }
    next();  // Call next() instead of returning
  };
}