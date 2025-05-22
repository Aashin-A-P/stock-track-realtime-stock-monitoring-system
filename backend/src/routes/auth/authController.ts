import { Request, Response } from "express";
import { usersTable } from "../../db/schemas/usersSchema";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { userPrivilegeTable } from "../../db/schemas/UserPrivilegesschema";
import { privilegesTable } from "../../db/schemas/privilegesSchema";
import { generateUserToken } from "../../../utils";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.cleanBody;
    req.logMessages = [`Login attempt by userName: ${userName}`];

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userName, userName));

    if (!user) {
      req.logMessages.push(`Login failed (user not found): ${userName}`);
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      req.logMessages.push(`Login failed (incorrect password): ${userName}`);
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    req.logMessages.push(`Login successful: ${userName}`);

    const privileges = await db
      .select({
        privilege: privilegesTable.privilege,
      })
      .from(userPrivilegeTable)
      .innerJoin(usersTable, eq(userPrivilegeTable.userId, usersTable.userId))
      .innerJoin(
        privilegesTable,
        eq(userPrivilegeTable.privilegeId, privilegesTable.privilegeId)
      )
      .where(eq(usersTable.userName, user.userName));

    const AllPrivileges: String[] = privileges.map(
      (p: { privilege: String }) => p.privilege
    );

    const token = generateUserToken({
      user,
      privileges: AllPrivileges,
    });

    // @ts-ignore
    delete user.password;
    res.status(200).json({ token, user });
  } catch (e) {
    req.logMessages?.push(
      `Login error for user ${req.cleanBody?.userName || "unknown"}: ${
        (e as Error).message
      }`
    );
    res.status(500).json({ error: "Something went wrong" });
  }
};
