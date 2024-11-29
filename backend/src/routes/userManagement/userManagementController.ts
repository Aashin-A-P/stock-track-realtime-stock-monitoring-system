import { Request, Response } from 'express';
import { usersTable } from '../../db/schemas/usersSchema';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { eq, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { userPrivilegeTable } from '../../db/schemas/UserPrivilegesschema';
import { privilegesTable } from '../../db/schemas/privilegesSchema';

const generateUserToken = (user: any) => {
    const secretKey : string = process.env.SECRET_KEY!;
    return jwt.sign({ userId: user.userId, role: user.role }, secretKey, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.cleanBody;

    // Validate required fields
    if (!data.userName || !data.password || !data.privileges || !Array.isArray(data.privileges)) {
      res.status(400).json({ message: "Username, password, and privileges are required" });
      return;
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);

    // Check if the username already exists
    const isExist = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userName, data.userName))
      .then((result) => result.length > 0);

    if (isExist) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // Create the user
    const [user] = await db.insert(usersTable).values({
      userName: data.userName,
      password: data.password,
      role: data.role || "user",
    }).returning();

    if (!user) {
      res.status(500).json({ message: "Failed to create user" });
      return;
    }

    // Process privileges to insert
    const privilegesToInsert = data.privileges.map((privilege: string) => ({ privilege }));

    // Insert new privileges into the PrivilegesTable, ignoring duplicates
    const insertedPrivileges = await db.insert(privilegesTable)
      .values(privilegesToInsert)
      .onConflictDoNothing()
      .returning();

    // Fetch all privileges (existing + newly inserted) to get their IDs
    const allPrivileges = await db
      .select()
      .from(privilegesTable)
      .where(inArray(privilegesTable.privilege, data.privileges));

    // Map privileges to UserPrivilegeTable entries
    const userPrivilegesData = allPrivileges.map((privilege) => ({
      userId: user.userId,
      privilegeId: privilege.privilegeId,
    }));

    // Insert user-privilege relationships
    await db.insert(userPrivilegeTable).values(userPrivilegesData);

    // Remove sensitive data (password)
    // @ts-ignore
    delete user.password;

    // Generate token with user privileges
    const token = generateUserToken({
      ...user,
      privileges: allPrivileges.map((p) => p.privilege),
    });

    // Send response with user data and token
    res.status(201).json({ user, token });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      console.error("Error registering user:", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.cleanBody.userId);
    await db.delete(usersTable).where(eq(usersTable.userId, userId)).execute();
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong');
  }
};
