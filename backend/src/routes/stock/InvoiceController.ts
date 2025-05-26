import { Request, Response } from "express";
import { db } from "../../db/index";
import { desc, eq } from "drizzle-orm";
import { invoiceTable } from "../../db/schemas/invoicesSchema";
import { Product } from '../../../../.history/frontend/src/types/index_20250526101116';
import { productsTable } from "../../db/schemas/productsSchema";

export const addInvoice = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNo,
      fromAddress,
      toAddress,
      totalAmount,
      invoiceDate,
      PODate,
      invoiceImage,
      budgetId,
    } = req.cleanBody;

    if (
      !invoiceNo ||
      !fromAddress ||
      !toAddress ||
      !totalAmount ||
      !invoiceDate ||
      !PODate ||
      !budgetId
    ) {
      req.logMessages = ["Failed to add invoice", "Missing required fields"];
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
        totalAmount,
        PODate,
        invoiceDate,
        invoiceImage,
        budgetId,
      })
      .returning();

    req.logMessages = [
      `Invoice #${newInvoice.invoiceNo} added successfully. Invoice ID: ${newInvoice.invoiceId}`
    ];

    res.status(201).json({
      message: "Invoice added successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error(error);
    req.logMessages = ["Error adding invoice", (error as Error).message];
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
      totalAmount,
      PODate,
      invoiceDate,
      invoiceImage,
      budgetId,
    } = req.cleanBody;

    const [updatedInvoice] = await db
      .update(invoiceTable)
      .set({
        invoiceNo,
        fromAddress,
        toAddress,
        totalAmount,
        PODate,
        invoiceDate,
        invoiceImage,
        budgetId,
      })
      .where(eq(invoiceTable.invoiceId, Number(id)))
      .returning();

    if (!updatedInvoice) {
      req.logMessages = [`Invoice update failed`, `Invoice ID ${id} not found`];
      return res.status(404).send("Invoice not found");
    }

    req.logMessages = [
      `Invoice #${updatedInvoice.invoiceNo} updated successfully`,
      `Invoice ID: ${updatedInvoice.invoiceId}`,
    ];

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error(error);
    req.logMessages = ["Error updating invoice", (error as Error).message];
    res.status(500).send("Failed to update invoice");
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedInvoice] = await db
      .delete(invoiceTable)
      .where(eq(invoiceTable.invoiceId, Number(id)))
      .returning();

    if (!deletedInvoice) {
      req.logMessages = [`Invoice delete failed`, `Invoice ID ${id} not found`];
      return res.status(404).send("Invoice not found");
    }

    req.logMessages = [
      `Invoice #${deletedInvoice.invoiceNo} deleted successfully`,
      `Invoice ID: ${deletedInvoice.invoiceId}`,
    ];

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error(error);
    req.logMessages = ["Error deleting invoice", (error as Error).message];
    res.status(500).send("Failed to delete invoice");
  }
};


// function to delete all the products associated with an invoice
export const deleteAllProductsByInvoiceId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Delete Products Id invoice : ", id);

    const result = await db
      .delete(productsTable)
      .where(eq(productsTable.invoiceId, Number(id)));

    if (result.rowCount === 0) {
      return res.status(404).send("No products found for this invoice");
    }

    req.logMessages = [`All products for invoice ID ${id} deleted successfully`];
    res.status(200).json({ message: "All products deleted successfully" });
  } catch (error) {
    console.error(error);
    req.logMessages = ["Error deleting products by invoice ID", (error as Error).message];
    res.status(500).send("Failed to delete products by invoice ID");
  }
};