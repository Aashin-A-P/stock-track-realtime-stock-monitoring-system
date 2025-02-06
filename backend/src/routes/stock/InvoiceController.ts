import { Request, Response } from "express";
import { db } from "../../db/index";
import { desc, eq } from "drizzle-orm";
import { invoiceTable } from "../../db/schemas/invoicesSchema";

export const addInvoice = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNo,
      fromAddress,
      toAddress,
      actualAmount,
      gstAmount,
      invoiceDate,
      invoiceImage,
    } = req.cleanBody;

    console.log("Invoice Data : ", req.cleanBody);

    if (
      !invoiceNo ||
      !fromAddress ||
      !toAddress ||
      !actualAmount ||
      !gstAmount ||
      !invoiceDate
    ) {
      return res
        .status(400)
        .send("All fields except invoiceImage are required");
    }

    const [newInvoice] = await db
      .insert(invoiceTable)
      .values({
        invoiceNo,
        fromAddress,
        toAddress,
        actualAmount,
        gstAmount,
        invoiceDate,
        invoiceImage,
      })
      .returning();

    res
      .status(201)
      .json({ message: "Invoice added successfully", invoice: newInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add invoice");
  }
};

export const showInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [invoice] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.invoiceId, Number(id)))
      .limit(1);

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    res.status(200).json({ invoice });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve invoice");
  }
};

export const showInvoices = async (_req: Request, res: Response) => {
  try {
    const invoices = await db.select().from(invoiceTable);

    res.status(200).json({ invoices });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve invoices");
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      invoiceNo,
      fromAddress,
      toAddress,
      actualAmount,
      gstAmount,
      invoiceDate,
      invoiceImage,
    } = req.cleanBody;

    const [updatedInvoice] = await db
      .update(invoiceTable)
      .set({
        invoiceNo,
        fromAddress,
        toAddress,
        actualAmount,
        gstAmount,
        invoiceDate,
        invoiceImage,
      })
      .where(eq(invoiceTable.invoiceId, Number(id)))
      .returning();

    if (!updatedInvoice) {
      return res.status(404).send("Invoice not found");
    }

    res
      .status(200)
      .json({
        message: "Invoice updated successfully",
        invoice: updatedInvoice,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update invoice");
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await db
      .delete(invoiceTable)
      .where(eq(invoiceTable.invoiceId, Number(id)))
      .returning();

    if (!deletedInvoice) {
      return res.status(404).send("Invoice not found");
    }

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete invoice");
  }
};
