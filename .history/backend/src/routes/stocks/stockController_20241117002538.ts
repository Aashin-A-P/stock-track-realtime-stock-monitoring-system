import { Request, Response } from "express";
import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { productsTable } from "../../db/schemas/productsSchema";
import { logsTable } from "../../db/schemas/logsSchema";

export const deleteStock = async (req: Request, res: Response) => {
  const { volNo, pageNo, serialNo } = req.body;

  if (!volNo || !pageNo || !serialNo) {
    return res.status(400).json({ error: "volNo, pageNo, and serialNo are required" });
  }

  try {
    const productId = `${volNo}-${pageNo}-${serialNo}`;
    const deletedProduct = await db
      .delete(productsTable)
      .where(eq(productsTable.productId, productId));

    if (deletedProduct.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.insert(logsTable).values({
      description: `Deleted stock with Product ID: ${productId}`,
    });

    res.json({ message: "Stock deleted and log entry created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateStock = async (req: Request, res: Response) => {
    const { volNo, pageNo, serialNo, ...updateData } = req.body;
  
    if (!volNo || !pageNo || !serialNo) {
      return res.status(400).json({ error: "volNo, pageNo, and serialNo are required" });
    }
  
    try {
      const productId = `${volNo}-${pageNo}-${serialNo}`;
      const updated = await db
        .update(productsTable)
        .set(updateData)
        .where(eq(productsTable.productId, productId));
  
      if (updated.rowCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      await db.insert(logsTable).values({
        description: `Updated stock with Product ID: ${productId}`,
      });
  
      res.json({ message: "Stock updated and log entry created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  