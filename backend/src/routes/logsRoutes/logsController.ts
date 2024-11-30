import { logsTable } from "../../db/schemas/logsSchema";
import { Request, Response } from "express";
import { db } from "../../db";
import { desc, eq } from "drizzle-orm";

export const getRecentLogs = async (req: Request, res: Response) => {
    const numberOfLogs: number = parseInt(req.query.numberOfLogs as string);

    try {
        const logs = (!numberOfLogs) ? await db.select().from(logsTable).orderBy(desc(logsTable.logId)).limit(numberOfLogs) : await db.select().from(logsTable).orderBy(desc(logsTable.logId));
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}
