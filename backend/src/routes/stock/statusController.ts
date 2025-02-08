import { Request, Response } from "express";
import { db } from "../../db/index";
import { eq } from "drizzle-orm";
import { statusTable } from "../../db/schemas/statusSchema";

export const addStatus = async (req: Request, res: Response) => {
  try {
    const { statusDescription } = req.cleanBody;

    if (!statusDescription) {
      return res.status(400).send("Status description is required");
    }

    const [newStatus] = await db
      .insert(statusTable)
      .values({ statusDescription })
      .returning();

    res
      .status(201)
      .json({ message: "Status added successfully", status: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add status");
  }
};

export const showStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [status] = await db
      .select()
      .from(statusTable)
      .where(eq(statusTable.statusId, Number(id)))
      .limit(1);

    if (!status) {
      return res.status(404).send("Status not found");
    }

    res.status(200).json({ status });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve status");
  }
};

export const showStatuses = async (_req: Request, res: Response) => {
  try {
    const statuses = await db.select().from(statusTable);

    res.status(200).json({ statuses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve statuses");
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { statusDescription } = req.cleanBody;

    const [updatedStatus] = await db
      .update(statusTable)
      .set({ statusDescription })
      .where(eq(statusTable.statusId, Number(id)))
      .returning();

    if (!updatedStatus) {
      return res.status(404).send("Status not found");
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", status: updatedStatus });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update status");
  }
};

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedStatus = await db
      .delete(statusTable)
      .where(eq(statusTable.statusId, Number(id)))
      .returning();

    if (!deletedStatus) {
      return res.status(404).send("Status not found");
    }

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete status");
  }
};

export const searchStatus = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    console.log("Search Query: ", query);

    if (!query) {
      return res.status(400).send("Search query is required");
    }

    const [statusData] = await db
      .select()
      .from(statusTable)
      .where(eq(statusTable.statusDescription, query))
      .limit(1);

    console.log("Status Data: ", statusData);

    res.status(200).json(statusData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to search status");
  }
};
