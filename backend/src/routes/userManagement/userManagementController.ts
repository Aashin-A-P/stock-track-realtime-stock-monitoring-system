import { Request, Response } from 'express';
import { usersTable } from '../../db/schemas/usersSchema';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { eq, inArray } from 'drizzle-orm';
import { userPrivilegeTable } from '../../db/schemas/UserPrivilegesschema';
import { privilegesTable } from '../../db/schemas/privilegesSchema';
import { generateUserToken } from '../../../utils';

// Helper function to check if a user already exists
const userExists = async (userName: string) => {
  const result = await db.select().from(usersTable).where(eq(usersTable.userName, userName));
  return result.length > 0;
};

// Helper function to get privilege IDs for a list of privileges
const getPrivilegeIds = async (privileges: string[]) => {
  const allPrivileges = await db.select()
    .from(privilegesTable)
    .where(inArray(privilegesTable.privilege, privileges));

  return allPrivileges.map(p => p.privilegeId);
};

// Main user registration handler
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, password, privileges, role } = req.cleanBody;

    // Validate required fields
    if (!userName || !password || !Array.isArray(privileges)) {
      res.status(400).json({ message: "Username, password, and privileges are required" });
      return;
    }

    // Check if the user already exists
    if (await userExists(userName)) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const [user] = await db.insert(usersTable)
      .values({
        userName,
        password: hashedPassword,
        role: role || "user",
      })
      .returning();

      console.log("User", user);

    if (!user) {
      res.status(500).json({ message: "Failed to create user" });
      return;
    }

    // Insert privileges and retrieve IDs
    const privilegeIds = await getPrivilegeIds(privileges);

    console.log("Privilege IDs", privilegeIds);

    // Map privileges to UserPrivilegeTable entries
    const userPrivilegesData = privilegeIds.map(privilegeId => ({
      userId: user.userId,
      privilegeId,
    }));

    console.log("User Privileges Data", userPrivilegesData);

    // Insert user-privilege relationships
    await db.insert(userPrivilegeTable).values(userPrivilegesData);

    // Remove sensitive data (password)
    // @ts-ignore
      delete user.password;

    // Generate token with user privileges
    const token = generateUserToken({
      user,
      privileges: privileges,
    });

    res.status(201).json({ user, token });
    return;
  } catch (error: Error | any) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Main user deletion handler
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.cleanBody.userId);

    // Validate user ID
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists before attempting to delete
    const userToDelete = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    if (userToDelete.length === 0) {
      res.status(404).json({ message: "User not found" });
    }

    // Delete the user and their related data (user-privileges, etc.)
    await db.delete(userPrivilegeTable).where(eq(userPrivilegeTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.userId, userId)).execute();

    res.status(204).send();
  } catch (error : Error | any) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
