import { Request, Response } from "express";
import { db } from "../../db/index";
import { budgetsTable } from "../../db/schemas/budgetsSchema";
import { eq, ilike } from "drizzle-orm";

// Add Budget
export const addBudget = async (req: Request, res: Response) => {
  try {
    const { budgetName, startDate, endDate, amount } = req.body;

    if (!budgetName || !startDate || !endDate || !amount) {
      return res.status(400).send("All budget fields are required");
    }

    const [newBudget] = await db
      .insert(budgetsTable)
      .values({ budgetName, startDate, endDate, amount })
      .returning();

    req.logMessages = [`Budget added: ${budgetName}`];

    res.status(201).json({
      message: "Budget added successfully",
      budget: newBudget,
    });
  } catch (error: any) {
    req.logMessages = [
      `Failed to add budget: ${req.body?.budgetName || "unknown"} - ${
        error.message
      }`,
    ];
    res.status(500).send("Failed to add budget");
  }
};

// Show Budget by ID
export const showBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [budget] = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.budgetId, Number(id)))
      .limit(1);

    if (!budget) {
      return res.status(404).send("Budget not found");
    }

    res.status(200).json({ budget });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve budget");
  }
};

// Show All Budgets
export const showBudgets = async (_req: Request, res: Response) => {
  try {
    const budgets = await db.select().from(budgetsTable);
    res.status(200).json({ budgets });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve budgets");
  }
};

// Update Budget by ID
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { budgetName, startDate, endDate, amount } = req.body;

    if (!budgetName || !startDate || !endDate || !amount) {
      return res.status(400).send("All budget fields are required");
    }

    const [updatedBudget] = await db
      .update(budgetsTable)
      .set({ budgetName, startDate, endDate, amount })
      .where(eq(budgetsTable.budgetId, Number(id)))
      .returning();

    if (!updatedBudget) {
      req.logMessages = [`Failed to update budget (not found): ID ${id}`];
      return res.status(404).send("Budget not found");
    }

    req.logMessages = [`Budget updated: ID ${id}, Name ${budgetName}`];

    res.status(200).json({
      message: "Budget updated successfully",
      budget: updatedBudget,
    });
  } catch (error: any) {
    req.logMessages = [
      `Failed to update budget ID ${req.params?.id}: ${error.message}`,
    ];
    res.status(500).send("Failed to update budget");
  }
};

// Delete Budget by ID
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedBudget] = await db
      .delete(budgetsTable)
      .where(eq(budgetsTable.budgetId, Number(id)))
      .returning();

    if (!deletedBudget) {
      req.logMessages = [`Failed to delete budget (not found): ID ${id}`];
      return res.status(404).send("Budget not found");
    }

    req.logMessages = [
      `Budget deleted: ID ${id}, Name ${deletedBudget.budgetName}`,
    ];

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error: any) {
    req.logMessages = [
      `Failed to delete budget ID ${req.params?.id}: ${error.message}`,
    ];
    res.status(500).send("Failed to delete budget");
  }
};

// Search Budget by Name
export const searchBudget = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).send("Search query is required");
    }

    const budgets = await db
      .select()
      .from(budgetsTable)
      .where(ilike(budgetsTable.budgetName, `%${query}%`));

    if (budgets.length === 0) {
      return res.status(404).send("No matching budgets found");
    }

    res.status(200).json({ budgets });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to search budgets");
  }
};
