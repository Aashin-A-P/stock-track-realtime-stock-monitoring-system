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

      req.logMessages = [`User with id ${user.userId} created.`];


    if (!user) {
      res.status(500).json({ message: "Failed to create user" });
      return;
    }

    // Insert privileges and retrieve IDs
    const privilegeIds = await getPrivilegeIds(privileges);

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

    req.logMessages = [`User with id ${userId} deleted.`];
    res.status(204).send();
  } catch (error : Error | any) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const { userName, privileges } = req.cleanBody;

    // Validate user ID
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists before attempting to update
    const userToUpdate = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    if (userToUpdate.length === 0) {
      res.status(404).json({ message: "User not found" });
    }

    // Update the user
    await db.update(usersTable)
      .set({
        userName
      })
      .where(eq(usersTable.userId, userId))
      .execute();

    // Insert privileges and retrieve IDs
    const privilegeIds = await getPrivilegeIds(privileges);

    // Delete existing user-privilege relationships
    await db.delete(userPrivilegeTable).where(eq(userPrivilegeTable.userId, userId));

    // Map privileges to UserPrivilegeTable entries
    const userPrivilegesData = privilegeIds.map(privilegeId => ({
      userId,
      privilegeId,
    }));

    // Insert user-privilege relationships
    await db.insert(userPrivilegeTable).values(userPrivilegesData);

    req.logMessages = [`User with ID ${userId} updated.`];
    res.status(204).send();
  } catch (error : Error | any) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// get user 
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    // Validate user ID
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists before attempting to retrieve
    const [user] = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    // Get user privileges
    const userPrivileges = await db.select()
      .from(userPrivilegeTable)
      .innerJoin(privilegesTable, eq(userPrivilegeTable.privilegeId, privilegesTable.privilegeId))
      .where(eq(userPrivilegeTable.userId, userId));

    // Remove sensitive data (password)
    // @ts-ignore
    delete user.password;

    res.status(200).json({ user, privileges: userPrivileges });
  } catch (error : Error | any) {
    console.error("Error getting user:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// getAllUsers
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.select().from(usersTable);

    res.status(200).json(users);
  } catch (error : Error | any) {
    console.error("Error getting all users:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}