import { Request, Response } from "express";
import { db } from "../../db/index";
import { eq } from "drizzle-orm";
import { remarksTable } from "../../db/schemas/remarksSchema";

export const addRemark = async (req: Request, res: Response) => {
  try {
    const { remark } = req.cleanBody;

    if (!remark) {
      return res.status(400).send("Remark is required");
    }

    const [newRemark] = await db
      .insert(remarksTable)
      .values({ remark })
      .returning();

    res
      .status(201)
      .json({ message: "Remark added successfully", remark: newRemark });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add remark");
  }
};

export const showRemark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [remark] = await db
      .select()
      .from(remarksTable)
      .where(eq(remarksTable.remarkId, Number(id)))
      .limit(1);

    if (!remark) {
      return res.status(404).send("Remark not found");
    }

    res.status(200).json({ remark });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve remark");
  }
};

export const showRemarks = async (_req: Request, res: Response) => {
  try {
    const remarks = await db.select().from(remarksTable);

    res.status(200).json({ remarks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve remarks");
  }
};

export const updateRemark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { remark } = req.cleanBody;

    const [updatedRemark] = await db
      .update(remarksTable)
      .set({ remark })
      .where(eq(remarksTable.remarkId, Number(id)))
      .returning();

    if (!updatedRemark) {
      return res.status(404).send("Remark not found");
    }

    res
      .status(200)
      .json({ message: "Remark updated successfully", remark: updatedRemark });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update remark");
  }
};

export const deleteRemark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedRemark = await db
      .delete(remarksTable)
      .where(eq(remarksTable.remarkId, Number(id)))
      .returning();

    if (!deletedRemark) {
      return res.status(404).send("Remark not found");
    }

    res.status(200).json({ message: "Remark deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete remark");
  }
};
