import { Router } from "express";
import { db } from "../../src/db";
import { budgetsTable } from "../../src/db/schemas/budgetsSchema";
import { eq } from "drizzle-orm";

const router = Router();

// endpoints for budgets
router.get("/", async (req, res) => {
  try {
    const allBudgets = await db.select().from(budgetsTable);
    if (!allBudgets) {
      res.status(404).send("No budgets found!");
    }
    res.json(allBudgets);

  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const budget = await db.select().from(budgetsTable).where(eq(budgetsTable.budgetId, Number(id)));
  if (!budget) {
    res.status(404).send("Budget Not found!");
  }
  res.json(budget);
});

router.post("/", async (req, res) => {
  const budget = req.body;
  if (!budget) {
    res.status(404).send("Budget Not found!");
  }
  const newBudget = await db.insert(budgetsTable).values(budget).returning();  
  res.status(201).json(newBudget);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updateBudget = req.body;
  if (!updateBudget) {
    res.status(404).send("Budget Not found!");
  }

  const oldBudget = await db.select().from(budgetsTable).where(eq(budgetsTable.budgetId, Number(id)));

  Object.assign(oldBudget || "", updateBudget);

  res.status(201).json(oldBudget);
});

export default router;
